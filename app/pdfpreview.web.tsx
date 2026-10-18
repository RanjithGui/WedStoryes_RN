import {
  assetUri,
  Icon,
  LOGO,
  NavLink,
  NoEventSelected,
  PageSkeleton,
  useSelectedEvent,
  useStoreHydrated,
  WebShell,
} from "@/components/web/ui";
import { buildQuotationHtml } from "@/utils/quotationHtml";
import React, { useEffect, useRef, useState } from "react";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
// .page in the quotation template is 760px wide plus 16px body padding.
const DOC_WIDTH = 800;

const clampZoom = (z: number) =>
  Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)) * 100) / 100;

export default function QuotationPage() {
  const hydrated = useStoreHydrated();
  const event = useSelectedEvent();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // Inline the logo as a data URL so it survives printing from srcDoc.
  useEffect(() => {
    const uri = assetUri(LOGO);
    if (!uri) return;
    fetch(uri)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }),
      )
      .then(setLogo)
      .catch((error) => console.log("Logo load error:", error));
  }, []);

  const applyZoom = (z: number) => {
    const body = frameRef.current?.contentDocument?.body;
    if (body) body.style.zoom = String(z);
  };

  useEffect(() => {
    applyZoom(zoom);
  }, [zoom]);

  const fitZoom = () => {
    const width = frameRef.current?.clientWidth ?? DOC_WIDTH;
    return clampZoom(Math.min(1, width / DOC_WIDTH));
  };

  const client = event?.clientDetails;
  const docTitle = ["Quotation", client?.name, event?.title].filter(Boolean).join(" - ");

  const onFrameLoad = () => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    doc.body.style.background = "transparent";
    // Browsers use the printed document's title as the default PDF filename.
    doc.title = docTitle;
    const fitted = fitZoom();
    if (fitted < 1) setZoom(fitted);
    applyZoom(fitted < 1 ? fitted : zoom);
  };

  const download = () => {
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    // Print the quotation at 100% so the A4 @page layout is unaffected.
    applyZoom(1);
    win.focus();
    win.print();
    applyZoom(zoom);
  };

  if (!hydrated) {
    return (
      <WebShell step={3} title="Quotation">
        <PageSkeleton />
      </WebShell>
    );
  }

  if (!event?.id || event.id === "customevent") {
    return (
      <WebShell step={3} title="Quotation">
        <NoEventSelected />
      </WebShell>
    );
  }

  return (
    <WebShell step={3} title={docTitle} mainClassName="ws-preview-main">
      <div className="ws-toolbar">
        <div>
          <span className="ws-eyebrow">Step 4 · Quotation</span>
          <h1 className="ws-title" style={{ fontSize: 36 }}>
            {client?.name ? `For ${client.name}` : event.title}
          </h1>
        </div>
        <div className="ws-toolbar-group">
          <div className="ws-zoom" role="group" aria-label="Zoom">
            <button
              type="button"
              className="ws-icon-btn"
              aria-label="Zoom out"
              disabled={zoom <= MIN_ZOOM}
              onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))}
            >
              <Icon name="minus" size={16} />
            </button>
            <output aria-live="polite">{Math.round(zoom * 100)}%</output>
            <button
              type="button"
              className="ws-icon-btn"
              aria-label="Zoom in"
              disabled={zoom >= MAX_ZOOM}
              onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))}
            >
              <Icon name="plus" size={16} />
            </button>
            <button
              type="button"
              className="ws-icon-btn"
              aria-label="Fit to width"
              title="Fit to width"
              onClick={() => setZoom(fitZoom())}
            >
              <Icon name="fit" size={16} />
            </button>
          </div>
          <NavLink href="/clientandpdf" className="ws-btn ws-btn-outline">
            <Icon name="pencil" size={15} /> Edit details
          </NavLink>
          <button type="button" className="ws-btn ws-btn-primary" onClick={download}>
            <Icon name="printer" size={16} /> Download PDF
          </button>
        </div>
      </div>

      {!client?.name && (
        <div className="ws-banner">
          <Icon name="user" />
          <span>
            Client details are missing from this quotation.{" "}
            <NavLink href="/clientandpdf" className="ws-link">
              Add them
            </NavLink>
          </span>
        </div>
      )}

      <div className="ws-canvas">
        <iframe
          ref={frameRef}
          title="Quotation preview"
          srcDoc={buildQuotationHtml(event, logo)}
          onLoad={onFrameLoad}
        />
      </div>
      <p className="ws-muted" style={{ fontSize: 13 }}>
        Tip: in the print dialog, choose <strong>Save as PDF</strong> as the destination.
      </p>
    </WebShell>
  );
}
