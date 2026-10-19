// Builds the quotation PDF file in the browser (html2canvas + jsPDF) so
// "Download PDF" doesn't depend on the browser's print engine. Mobile print
// dialogs (iOS Safari, Android Chrome) drop the table borders and add their
// own scaling; a rendered file looks the same on every device.

// Width the quotation is laid out at before being scaled onto A4.
const RENDER_WIDTH = 760;
const PAGE_W_MM = 210;
const PAGE_H_MM = 297;
const MARGIN_MM = 12;
const CONTENT_W_MM = PAGE_W_MM - MARGIN_MM * 2;
const CONTENT_H_MM = PAGE_H_MM - MARGIN_MM * 2;
const MM_PER_PX = CONTENT_W_MM / RENDER_WIDTH;
const PAGE_H_PX = CONTENT_H_MM / MM_PER_PX;
// Stay well under iOS Safari's ~16.7M pixel canvas limit.
const MAX_CANVAS_PIXELS = 12_000_000;

// Present the document as a plain white sheet (the template's screen styles
// add a grey backdrop, padding and a drop shadow for the on-screen preview).
const RENDER_STYLES = `<style>
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  .page { width: ${RENDER_WIDTH}px; max-width: none; margin: 0; padding: 0; box-shadow: none; }
</style>`;

// html2canvas measures font baselines with a hidden <img> in the *parent*
// document; Tailwind's preflight (img { display: block }) breaks that
// measurement and every line of text is drawn several px too low. Undo it
// for the duration of the render.
function patchParentImgStyles() {
  const style = document.createElement("style");
  style.textContent = "img { display: inline !important; vertical-align: baseline !important; }";
  document.head.appendChild(style);
  return () => style.remove();
}

function loadOffscreenFrame(html: string): Promise<HTMLIFrameElement> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${RENDER_WIDTH}px;height:${Math.ceil(PAGE_H_PX)}px;border:0;`;
    frame.onload = () => resolve(frame);
    frame.onerror = () => reject(new Error("Could not load quotation"));
    frame.srcdoc = html.replace("</head>", `${RENDER_STYLES}</head>`);
    document.body.appendChild(frame);
  });
}

async function whenReady(doc: Document) {
  await doc.fonts?.ready;
  await Promise.all(
    Array.from(doc.images).map((img) =>
      img.complete
        ? undefined
        : new Promise((done) => {
            img.onload = img.onerror = done;
          }),
    ),
  );
}

// Y offsets (CSS px from the top of `root`) where a page may end without
// slicing through content: the bottom of every table row, and the gap
// between consecutive lines of text outside tables.
function breakCandidates(doc: Document, root: HTMLElement) {
  const top = root.getBoundingClientRect().top;
  const ys: number[] = [];
  root.querySelectorAll("tr, table").forEach((el) => {
    ys.push(el.getBoundingClientRect().bottom - top + 1);
  });
  const lines: { top: number; bottom: number }[] = [];
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = doc.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim() || node.parentElement?.closest("table")) continue;
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) {
      lines.push({ top: rect.top - top, bottom: rect.bottom - top });
    }
  }
  lines.sort((a, b) => a.top - b.top);
  lines.forEach((line, i) => {
    const next = lines[i + 1];
    ys.push(next && next.top >= line.bottom ? (line.bottom + next.top) / 2 : line.bottom + 2);
  });
  return ys.sort((a, b) => a - b);
}

function pageBreaks(candidates: number[], totalHeight: number) {
  const breaks: number[] = [];
  let start = 0;
  while (totalHeight - start > PAGE_H_PX) {
    const limit = start + PAGE_H_PX;
    // Latest safe break on this page, as long as it fills at least half of it.
    const safe = candidates.filter((y) => y > start + PAGE_H_PX / 2 && y <= limit);
    const end = safe.length ? Math.round(safe[safe.length - 1]) : limit;
    breaks.push(end);
    start = end;
  }
  return breaks;
}

export async function downloadQuotationPdf(html: string, fileName: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const frame = await loadOffscreenFrame(html);
  const restoreImgStyles = patchParentImgStyles();
  try {
    const doc = frame.contentDocument;
    const page = doc?.querySelector<HTMLElement>(".page");
    if (!doc || !page) throw new Error("Quotation preview is empty");
    await whenReady(doc);

    const height = page.scrollHeight;
    const scale = Math.min(2.5, Math.sqrt(MAX_CANVAS_PIXELS / (RENDER_WIDTH * height)));
    const canvas = await html2canvas(page, {
      scale,
      backgroundColor: "#ffffff",
      width: RENDER_WIDTH,
      windowWidth: RENDER_WIDTH,
      logging: false,
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const edges = [0, ...pageBreaks(breakCandidates(doc, page), height), height];
    const slice = document.createElement("canvas");
    const ctx = slice.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported");

    for (let i = 0; i < edges.length - 1; i++) {
      const sliceTop = Math.round(edges[i] * scale);
      const sliceHeight = Math.round((edges[i + 1] - edges[i]) * scale);
      slice.width = canvas.width;
      slice.height = sliceHeight;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, sliceTop, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      if (i > 0) pdf.addPage();
      pdf.addImage(
        slice.toDataURL("image/jpeg", 0.95),
        "JPEG",
        MARGIN_MM,
        MARGIN_MM,
        CONTENT_W_MM,
        (sliceHeight / scale) * MM_PER_PX,
      );
    }

    pdf.save(`${fileName.replace(/[\\/:*?"<>|]+/g, "").trim() || "quotation.wedstoryes"}.pdf`);
  } finally {
    restoreImgStyles();
    frame.remove();
  }
}
