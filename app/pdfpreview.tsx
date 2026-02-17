import { useGlobalStore } from "@/store/globalstore";
import {
  Addons,
  Photographers,
  SubEventDetails,
  Videographers,
} from "@/types/types";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PDFPreview() {
  const selectedEvent = useGlobalStore((s) =>
    s.events.find((e) => e.id === s.selectedEventId),
  );

  const events: SubEventDetails[] = selectedEvent?.eventDetails || [];

  /* ---------------- FORMATTERS ---------------- */

  const formatPhotographers = (crew?: Photographers | null) => {
    if (!crew) return "";

    const rows: string[] = [];

    if (crew.traditional && crew.traditional > 0)
      rows.push(`${crew.traditional} Traditional`);

    if (crew.candid && crew.candid > 0) rows.push(`${crew.candid} Candid`);

    return rows.join("<br/>");
  };

  const formatVideographers = (crew?: Videographers | null) => {
    if (!crew) return "";

    const rows: string[] = [];

    if (crew.traditional && crew.traditional > 0)
      rows.push(`${crew.traditional} Traditional`);

    if (crew.candid && crew.candid > 0) rows.push(`${crew.candid} Candid`);

    return rows.join("<br/>");
  };

  const formatAddons = (addons?: Addons | null) => {
    if (!addons) return "";

    const rows: string[] = [];

    if (addons.drone) rows.push(`${addons.drone} Drone`);
    if (addons.albums) rows.push(`${addons.albums} Albums`);
    if (addons.ledscreens) rows.push(`${addons.ledscreens} LED Screens`);
    if (addons.livestreaming)
      rows.push(`${addons.livestreaming} Live Streaming`);
    if (addons.makeupartist) rows.push(`${addons.makeupartist} Makeup Artist`);
    if (addons.decorations) rows.push(`${addons.decorations} Decorations`);
    if (addons.invitations) rows.push(`${addons.invitations} Invitations`);

    return rows.join("<br/>");
  };

  /* ---------------- HTML GENERATION ---------------- */

  const htmlContent = useMemo(() => {
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
          font-size: 12px;
          padding: 20px;
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
          background-color: #ff0000;
          color: white;
        }

        .summary {
          width: 240px;
          margin-left: auto;
          margin-top: 30px;
        }

        .summary td:first-child {
          text-align: left;
        }

        .summary td:last-child {
          text-align: right;
        }

        .terms {
          font-size: 9px;
          margin-top: 30px;
          line-height: 16px;
        }
      </style>
    </head>

    <body>

      <div style="display:flex; justify-content:space-between;">
        <div></div>
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
          <th>Time</th>
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
            <td>${ev.time || ""}</td>
            <td>${formatAddons(ev.addons)}</td>
            <td>N/A</td>
          </tr>
        `,
          )
          .join("")}
      </table>

      <table class="summary">
        <tr>
          <th colspan="2">Amount</th>
        </tr>
        <tr>
          <td>Subtotal</td>
          <td>${subtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Discount</td>
          <td>${discount.toLocaleString()}</td>
        </tr>
        <tr>
          <td><b>Total</b></td>
          <td><b>${total.toLocaleString()}</b></td>
        </tr>
      </table>

      <div class="terms">
        <b>Terms and Conditions:</b><br/>
        ${(selectedEvent.termsAndConditions || "").replace(/\n/g, "<br/>")}
      </div>

    </body>
    </html>
    `;
  }, [selectedEvent]);

  /* ---------------- PRINT HANDLER ---------------- */

  const handleDownload = async () => {
    try {
      // Generate temporary PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });

      // Create permanent path
      const fileName = `Quotation_${Date.now()}.pdf`;
      const newPath = FileSystem.documentDirectory + fileName;

      // Move file into app documents
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      console.log("Saved at:", newPath);

      Alert.alert("Success", "PDF saved locally");

      // Optional: open share dialog
      await Sharing.shareAsync(newPath);
    } catch (error) {
      console.log("PDF ERROR:", error);
      Alert.alert("Error", "Failed to generate PDF");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
      />

      <Pressable
        onPress={() => {
          handleDownload();
        }}
        style={({ pressed }) => [
          styles.button,
          {
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <Text style={styles.text}>Download PDF</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  buttonContainer: {
    padding: 10,
    backgroundColor: "#fff",
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
    justifyContent: "flex-end",
    marginHorizontal: 20,
    marginVertical: 20,
  },
});
