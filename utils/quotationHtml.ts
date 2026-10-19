import {
  Addons,
  EventItem,
  Photographers,
  SubEventDetails,
  Videographers,
} from "@/types/types";

// Quotation document shared by the native (WebView + expo-print) and web
// (iframe + window.print) previews, so both platforms produce the same PDF.

const escapeHtml = (value?: string | null) =>
  (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatPhotographers = (crew?: Photographers | null) => {
  if (!crew) return "";
  const rows: string[] = [];
  if (crew.traditional && crew.traditional > 0)
    rows.push(`${crew.traditional} x Traditional`);
  if (crew.candid && crew.candid > 0) rows.push(`${crew.candid} x Candid`);
  return rows.join("<br/>");
};

const formatVideographers = (crew?: Videographers | null) => {
  if (!crew) return "";
  const rows: string[] = [];
  if (crew.traditional && crew.traditional > 0)
    rows.push(`${crew.traditional} x Traditional`);
  if (crew.candid && crew.candid > 0) rows.push(`${crew.candid} x Candid`);
  return rows.join("<br/>");
};

const formatAddons = (addons?: Addons | null) => {
  if (!addons) return "";
  const rows: string[] = [];
  if (addons.drone) rows.push(`${addons.drone} x Drone`);
  if (addons.ledscreens) rows.push(`${addons.ledscreens} x LED Screens`);
  if (addons.livestreaming)
    rows.push(`${addons.livestreaming} x Live Streaming`);
  if (addons.makeupartist)
    rows.push(`${addons.makeupartist} x Makeup Artist`);
  if (addons.decorations) rows.push(`${addons.decorations} x Decorations`);
  if (addons.invitations) rows.push(`${addons.invitations} x Invitations`);
  return rows.join("<br/>");
};

export const buildQuotationHtml = (
  selectedEvent: EventItem | null | undefined,
  logo: string | null,
) => {
  if (!selectedEvent) return "<h1>No Event Selected</h1>";

  const events: SubEventDetails[] = selectedEvent.eventDetails || [];
  const hasPhotobookData = events.some(
    (ev) => (ev.addons?.photobook ?? 0) > 0 || (ev.addons?.sheets ?? 0) > 0,
  );

  const client = selectedEvent.clientDetails;
  const owner = selectedEvent.ownerDetails;
  const subtotal = Number(selectedEvent.totalPrice?.replace(/\D/g, "") || 0);
  const discount = Number(
    selectedEvent.totalDiscount?.replace(/\D/g, "") || 0,
  );
  const total = subtotal - discount;

  const photobookRows = events
    .map((ev) => {
      const photobookCount = ev.addons?.photobook ?? 0;
      const sheetsCount = ev.addons?.sheets ?? 0;
      const description = ev.addons?.sheetsDescription ?? "";
      if (photobookCount === 0 && sheetsCount === 0) return "";
      return `
        <tr>
          <td>${photobookCount > 0 ? `${photobookCount} x PhotoBook` : ""}</td>
          <td>${sheetsCount > 0 ? sheetsCount : ""}</td>
          <td>${escapeHtml(description)}</td>
          <td>N/A</td>
        </tr>`;
    })
    .join("");

  const logoHtml = logo
    ? `<img src="${logo}" style="width:120px;height:70px;object-fit:contain;" />`
    : `<div style="width:120px;height:70px;"></div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  @page { size: A4; margin: 36px 28px; }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    box-sizing: border-box;
  }

  html, body { margin: 0; padding: 0; }

  body {
    font-family: Arial, sans-serif;
    font-size: 14px;
    background: #e0e0e0;
    padding: 16px;
  }

  /* WebView preview card */
  .page {
    background: white;
    max-width: 760px;
    margin: 0 auto;
    padding: 28px 24px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.2);
    position: relative;
  }

  #wm {
    position: absolute;
    top: 0; left: 0;
    pointer-events: none;
    z-index: 0;
  }

  .content {
    position: relative;
    z-index: 1;
  }

  @media print {
    /* The web preview zooms the body to fit small screens; mobile browsers
       print asynchronously, so never let that zoom reach the PDF. */
    body { background: white; padding: 0; margin: 0; zoom: 1 !important; }
    /* Pages are scaled down to fit A4, which can shrink 1px lines below a
       device pixel; use 1pt so the grid survives the scaling. */
    table { border-top-width: 1pt; border-left-width: 1pt; }
    th, td { border-right-width: 1pt; border-bottom-width: 1pt; }
    .page {
      box-shadow: none;
      margin: 0; padding: 0;
      max-width: 100%;
      overflow: visible;
    }
    table { page-break-inside: auto; }
    tr    { page-break-inside: avoid; page-break-after: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    .photobook-section { page-break-before: auto; }
    .summary { page-break-inside: avoid; }
    .terms   { page-break-inside: avoid; }
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .doc-title {
    text-align: center;
    font-size: 22px;
    font-weight: bold;
    margin: 16px 0;
  }

  /* Separate borders (top/left on the table, right/bottom on cells) instead
     of border-collapse: WebKit's print renderer (iOS Safari, expo-print)
     drops collapsed borders next to the red header backgrounds. */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-top: 1px solid #000;
    border-left: 1px solid #000;
    margin-top: 12px;
    font-size: 11px;
  }

  th, td {
    border-right: 1px solid #000;
    border-bottom: 1px solid #000;
    padding: 5px 7px;
    text-align: center;
    vertical-align: middle;
  }

  th {
    background-color: #ff0000 !important;
    color: #fff !important;
  }

  .photobook-section { margin-top: 20px; }

  .summary {
    width: 240px;
    margin-left: auto;
    margin-top: 24px;
  }
  .summary td:first-child { text-align: left; }
  .summary td:last-child  { text-align: right; }

  .terms {
    font-size: 13px;
    margin-top: 24px;
    line-height: 17px;
  }
</style>
</head>
<body>
<div class="page">
  <canvas id="wm"></canvas>
  <div class="content">

    <div class="header-row">
      ${logoHtml}
      <div style="font-size:12px;">Date: ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="doc-title">Quotation</div>

    <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:12px;">
      <div>
        <b>To:</b><br/>
        ${escapeHtml(client?.name)}<br/>
        ${escapeHtml(client?.email)}<br/>
        ${escapeHtml(client?.mobileNumber)}
      </div>
      <div style="text-align:right;">
        <b>From:</b><br/>
        The WedStoryes (${escapeHtml(owner?.name)})<br/>
        ${escapeHtml(owner?.email)}<br/>
        ${escapeHtml(owner?.mobileNumber)}
      </div>
    </div>

    <p style="margin:6px 0;">Dear ${escapeHtml(client?.name)},</p>
    <p style="margin:6px 0;">Thank you for choosing The wedstoryes for your big day.</p>
    <p style="margin:6px 0;">Please find the quotation below.</p>

    <table>
      <thead>
        <tr>
          <th>Event</th>
          <th>Photographers</th>
          <th>Videographers</th>
          <th>Date</th>
          <th>Addons</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${events
          .map(
            (ev) => `
        <tr>
          <td>${escapeHtml(ev.subEvent)}</td>
          <td>${formatPhotographers(ev.photographers)}</td>
          <td>${formatVideographers(ev.videographers)}</td>
          <td>${escapeHtml(ev.date)}</td>
          <td>${formatAddons(ev.addons)}</td>
          <td>N/A</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>

    ${
      hasPhotobookData
        ? `
    <div class="photobook-section">
      <table>
        <thead>
          <tr>
            <th>Photobook</th>
            <th>Sheets</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>${photobookRows}</tbody>
      </table>
    </div>`
        : ""
    }

    <table class="summary">
      <thead>
        <tr><th colspan="2">Amount</th></tr>
      </thead>
      <tbody>
        <tr><td>Subtotal</td><td>${subtotal.toLocaleString()}</td></tr>
        <tr><td>Discount</td><td>${discount.toLocaleString()}</td></tr>
        <tr><td><b>Total</b></td><td><b>${total.toLocaleString()}</b></td></tr>
      </tbody>
    </table>

    <div class="terms">
      <b>Terms and Conditions:</b><br/>
      ${escapeHtml(selectedEvent.termsAndConditions).replace(/\n/g, "<br/>")}
    </div>

  </div>
</div>

<script>
  (function () {
    var page   = document.querySelector('.page');
    var canvas = document.getElementById('wm');
    if (!canvas || !page) return;

    var W = page.scrollWidth  || 760;
    var H = page.scrollHeight || 1123;
    canvas.width  = W;
    canvas.height = H;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font         = 'bold 52px Arial';
    ctx.fillStyle    = 'rgba(180, 180, 180, 0.18)';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    var text  = 'WEDSTORYES';
    var textW = ctx.measureText(text).width;
    var tileW = textW + 120;
    var tileH = 180;

    for (var row = 0; row * tileH < H + tileH * 2; row++) {
      var offsetX = (row % 2 === 0) ? 0 : tileW / 2;
      for (var col = -1; col * tileW < W + tileW * 2; col++) {
        var cx = col * tileW + offsetX + tileW / 2;
        var cy = row * tileH + tileH / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-25 * Math.PI / 180);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
  })();
</script>
</body>
</html>`;
};
