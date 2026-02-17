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
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PDFPreview() {
  const selectedEvent = useGlobalStore((s) =>
    s.events.find((e) => e.id === s.selectedEventId),
  );

  const events: SubEventDetails[] = selectedEvent?.eventDetails || [];
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const asset = Asset.fromModule(require("../assets/images/logo.png"));

        await asset.downloadAsync();

        const base64 = await FileSystem.readAsStringAsync(asset.localUri!, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setLogoBase64(`data:image/png;base64,${base64}`);
        console.log("Logo loaded successfully");
      } catch (error) {
        console.log("Logo load error:", error);
      }
    };

    loadLogo();
  }, []);

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
    if (addons.albums) rows.push(`${addons.albums} x Albums`);
    if (addons.ledscreens) rows.push(`${addons.ledscreens} x LED Screens`);
    if (addons.livestreaming)
      rows.push(`${addons.livestreaming} x Live Streaming`);
    if (addons.makeupartist)
      rows.push(`${addons.makeupartist} x Makeup Artist`);
    if (addons.decorations) rows.push(`${addons.decorations} x Decorations`);
    if (addons.invitations) rows.push(`${addons.invitations} x Invitations`);

    return rows.join("<br/>");
  };

  const buildHtml = (logoBase64: string | null) => {
    if (!selectedEvent) return "<h1>No Event Selected</h1>";

    const client = selectedEvent.clientDetails;
    const owner = selectedEvent.ownerDetails;

    const subtotal = Number(selectedEvent.totalPrice?.replace(/\D/g, "") || 0);
    const discount = Number(
      selectedEvent.totalDiscount?.replace(/\D/g, "") || 0,
    );
    const total = subtotal - discount;

    return `
    <html>
    <head>
      <style>
        @page { size: A4; margin: 20px; }

        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          font-family: Arial;
          font-size: 14px;
          padding: 20px;
          position: relative;
        }

        /* WATERMARK */
        .watermark {
          position: fixed;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 90px;
          color: rgba(200,200,200,0.12);
          z-index: -1;
          white-space: nowrap;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          width: 120px;
          height: 70px;
          object-fit: contain;
        }

        .title {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 11px;
        }

        th, td {
          border: 1px solid black;
          padding: 6px;
          text-align: center;
          vertical-align: middle;
        }

        th {
          background-color: #ff0000 !important;
          color: white !important;
        }

        .summary {
          width: 240px;
          margin-left: auto;
          margin-top: 30px;
        }

        .summary td:first-child { text-align: left; }
        .summary td:last-child { text-align: right; }

        .terms {
          font-size: 9px;
          margin-top: 30px;
          line-height: 16px;
        }
      </style>
    </head>

    <body>

      <div class="watermark">WEDSTORYES</div>

      <div class="header-row">
       ${logoBase64 ? `<img src="${logoBase64}" class="logo" />` : ""}
        <!-- Alt text: WedStoryes logo displayed on the left side of the header row, representing the brand for a wedding event quotation document. The logo appears above a formal layout that includes client and owner contact details, a table summarizing event services such as photographers, videographers, addons, and pricing, and a watermark reading WEDSTORYES in large, faint letters across the background. The document has a professional and celebratory tone, with a red header row in the table and clear, organized sections. -->
        <div>Date: ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="title">Quotation</div>

      <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
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

      <p>Dear ${client?.name || ""},</p>
      <p>Thank you for choosing The wedstoryes for your big day.</p>
      <p>Please find the quotation below.</p>

      <table>
        <tr>
          <th>Event</th>
          <th>Photographers</th>
          <th>Videographers</th>
          <th>Date</th>
          <th>Addons</th>
          <th>Price</th>
        </tr>

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
          </tr>
        `,
          )
          .join("")}
      </table>

      <table class="summary">
        <tr><th colspan="2">Amount</th></tr>
        <tr><td>Subtotal</td><td>${subtotal.toLocaleString()}</td></tr>
        <tr><td>Discount</td><td>${discount.toLocaleString()}</td></tr>
        <tr><td><b>Total</b></td><td><b>${total.toLocaleString()}</b></td></tr>
      </table>

      <div class="terms">
        <b>Terms and Conditions:</b><br/>
        ${(selectedEvent.termsAndConditions || "").replace(/\n/g, "<br/>")}
      </div>

    </body>
    </html>
    `;
  };

  const handleDownload = async () => {
    try {
      const html = buildHtml(logoBase64);

      const { uri } = await Print.printToFileAsync({ html });

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
      <WebView
        originWhitelist={["*"]}
        source={{ html: buildHtml(logoBase64) }}
        style={styles.webview}
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
