import { useGlobalStore } from "@/store/globalstore";
import {
  Addons,
  Photographers,
  SubEventDetails,
  Videographers,
} from "@/types/types";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PDFPreview() {
  const selectedEvent = useGlobalStore((s) =>
    s.events.find((e) => e.id === s.selectedEventId),
  );

  const events: SubEventDetails[] = selectedEvent?.eventDetails || [];
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [zoom, setZoom] = useState(1.0);
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3.0;
  const ZOOM_STEP = 0.25;

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const asset = Asset.fromModule(require("../assets/images/logo.png"));
        await asset.downloadAsync();
        const base64 = await FileSystem.readAsStringAsync(asset.localUri!, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setLogoBase64(`data:image/png;base64,${base64}`);
      } catch (error) {
        console.log("Logo load error:", error);
      }
    };
    loadLogo();
  }, [selectedEvent]);

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

  const hasPhotobookData = events.some(
    (ev) => (ev.addons?.photobook ?? 0) > 0 || (ev.addons?.sheets ?? 0) > 0,
  );

  const changeZoom = (delta: number) => {
    setZoom((prev) => {
      const next = parseFloat(
        Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)).toFixed(2),
      );
      webViewRef.current?.injectJavaScript(`
        (function() {
          document.body.style.transform = 'scale(${next})';
          document.body.style.transformOrigin = 'top left';
          document.body.style.width = (100 / ${next}) + '%';
        })();
        true;
      `);
      return next;
    });
  };

  const buildHtml = (logo: string | null) => {
    if (!selectedEvent) return "<h1>No Event Selected</h1>";

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
            <td>${description}</td>
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
      body { background: white; padding: 0; margin: 0; }
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

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 11px;
    }

    th, td {
      border: 1px solid #000;
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
          ${client?.name || ""}<br/>
          ${client?.email || ""}<br/>
          ${client?.mobileNumber || ""}
        </div>
        <div style="text-align:right;">
          <b>From:</b><br/>
          The WedStoryes (${owner?.name || ""})<br/>
          ${owner?.email || ""}<br/>
          ${owner?.mobileNumber || ""}
        </div>
      </div>

      <p style="margin:6px 0;">Dear ${client?.name || ""},</p>
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
            <td>${ev.subEvent || ""}</td>
            <td>${formatPhotographers(ev.photographers)}</td>
            <td>${formatVideographers(ev.videographers)}</td>
            <td>${ev.date || ""}</td>
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
        ${(selectedEvent.termsAndConditions || "").replace(/\n/g, "<br/>")}
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

  const handleDownload = async () => {
    try {
      const html = buildHtml(logoBase64);
      const { uri } = await Print.printToFileAsync({
        html,
        margins: { top: 36, bottom: 36, left: 28, right: 28 },
      });
      const fileName = `${
        selectedEvent?.clientDetails?.name || "Quotation"
      }_${Date.now()}.pdf`;
      const newPath = FileSystem.documentDirectory + fileName;
      await FileSystem.moveAsync({ from: uri, to: newPath });
      await Sharing.shareAsync(newPath);
      Alert.alert("Success", "PDF saved & ready to share");
    } catch (error) {
      console.log("PDF ERROR:", error);
      Alert.alert("Error", "Failed to generate PDF");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarSide}>
          <Pressable
            hitSlop={10}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Image
              source={require("../assets/images/back_button.png")}
              style={{ width: 32, height: 32 }}
            />
          </Pressable>
        </View>

        <View style={styles.zoomRow}>
          <Pressable
            style={[styles.zoomBtn, zoom <= MIN_ZOOM && styles.zoomBtnDisabled]}
            onPress={() => changeZoom(-ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
          >
            <Text style={styles.zoomBtnText}>−</Text>
          </Pressable>
          <Text style={styles.zoomLabel}>{Math.round(zoom * 100)}%</Text>
          <Pressable
            style={[styles.zoomBtn, zoom >= MAX_ZOOM && styles.zoomBtnDisabled]}
            onPress={() => changeZoom(+ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
          >
            <Text style={styles.zoomBtnText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.topBarSide} />
      </View>

      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: buildHtml(logoBase64) }}
        style={styles.webview}
        javaScriptEnabled={true}
        scalesPageToFit={false}
        scrollEnabled={true}
        bounces={false}
      />

      <Pressable onPress={handleDownload} style={styles.button}>
        <Text style={styles.text}>Download PDF</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  topBarSide: {
    width: 80,
    alignItems: "flex-start",
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  zoomBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#C89B3C",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomBtnDisabled: {
    backgroundColor: "#ccc",
  },
  zoomBtnText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  zoomLabel: {
    minWidth: 52,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#C89B3C",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 20,
  },
});
