import ResponsiveContainer from "@/components/ResponsiveContainer";
import { useGlobalStore } from "@/store/globalstore";
import { buildQuotationHtml } from "@/utils/quotationHtml";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PDFPreview() {
  const selectedEvent = useGlobalStore((s) =>
    s.events.find((e) => e.id === s.selectedEventId),
  );

  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3.0;
  const ZOOM_STEP = 0.25;

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const asset = Asset.fromModule(require("../assets/images/logo.png"));
        if (Platform.OS === "web") {
          // expo-file-system has no real implementation on web, so read the
          // bundled asset URL directly via fetch + FileReader instead.
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          setLogoBase64(base64);
        } else {
          await asset.downloadAsync();
          const base64 = await FileSystem.readAsStringAsync(asset.localUri!, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setLogoBase64(`data:image/png;base64,${base64}`);
        }
      } catch (error) {
        console.log("Logo load error:", error);
      }
    };
    loadLogo();
  }, [selectedEvent]);

  const changeZoom = (delta: number) => {
    setZoom((prev) => {
      const next = parseFloat(
        Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)).toFixed(2),
      );
      if (Platform.OS === "web") {
        const frame = iframeRef.current;
        if (frame) {
          frame.style.transform = `scale(${next})`;
          frame.style.transformOrigin = "top left";
          frame.style.width = `${100 / next}%`;
          frame.style.height = `${100 / next}%`;
        }
      } else {
        webViewRef.current?.injectJavaScript(`
          (function() {
            document.body.style.transform = 'scale(${next})';
            document.body.style.transformOrigin = 'top left';
            document.body.style.width = (100 / ${next}) + '%';
          })();
          true;
        `);
      }
      return next;
    });
  };

  const buildHtml = (logo: string | null) =>
    buildQuotationHtml(selectedEvent, logo);

  const handleDownload = async () => {
    if (Platform.OS === "web") {
      const frame = iframeRef.current;
      if (!frame?.contentWindow) {
        Alert.alert("Error", "Preview not ready yet. Please try again.");
        return;
      }
      // Reset zoom so the preview transform doesn't affect the printed layout.
      frame.style.transform = "";
      frame.style.width = "100%";
      frame.style.height = "100%";
      setZoom(1.0);
      // Print the iframe's own document (not the outer app page), so only the
      // quotation content is printed and its A4 @page rules apply.
      frame.contentWindow.focus();
      frame.contentWindow.print();
      return;
    }

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
      <ResponsiveContainer maxWidth={900} style={styles.responsiveBody}>
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
              style={[
                styles.zoomBtn,
                zoom <= MIN_ZOOM && styles.zoomBtnDisabled,
              ]}
              onPress={() => changeZoom(-ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
            >
              <Text style={styles.zoomBtnText}>−</Text>
            </Pressable>
            <Text style={styles.zoomLabel}>{Math.round(zoom * 100)}%</Text>
            <Pressable
              style={[
                styles.zoomBtn,
                zoom >= MAX_ZOOM && styles.zoomBtnDisabled,
              ]}
              onPress={() => changeZoom(+ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
            >
              <Text style={styles.zoomBtnText}>+</Text>
            </Pressable>
          </View>

          <View style={styles.topBarSide} />
        </View>

        <View style={styles.webview}>
          {Platform.OS === "web"
            ? React.createElement("iframe", {
                ref: iframeRef,
                srcDoc: buildHtml(logoBase64),
                title: "Quotation Preview",
                style: {
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  border: "none",
                },
              })
            : (
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
              )}
        </View>

        <Pressable onPress={handleDownload} style={styles.button}>
          <Text style={styles.text}>Download PDF</Text>
        </Pressable>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  responsiveBody: { flex: 1 },
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
