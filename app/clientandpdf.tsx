import { useGlobalStore } from "@/store/globalstore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function clientAndPdf() {
  const router = useRouter();
  const selectedEvent = useGlobalStore((s) =>
    s.events.find((e) => e.id === s.selectedEventId),
  );
  const addclientdetails = useGlobalStore((s) => s.addclientdetails);
  const addTerms = useGlobalStore((s) => s.addTerms);
  const selectedEventDetails = selectedEvent?.eventDetails || [];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [terms, setTerms] = useState(
    "1. 50,000/- advance to confirm the booking and balance on event day." +
      "\n" +
      "2. Photos and videos will be delivered in 30-45 days, client selected pictures." +
      "\n" +
      "3. 60 sheets premium Albums set of 2 premium Albums Additional sheet cost 650 per sheet." +
      "\n" +
      "4. Full length documentary Teaser." +
      "\n" +
      "5. Three traditional full length videos." +
      "\n" +
      "6. On wedding day client have to pay 1,00,000/- Once Album design completed, If any change's Is their we will be reedit it.printing sending day we will ask 40,000/-Albums videos will be delivered 15-20 days." +
      "\n" +
      "7. Client have to purchase 2 hard disks" +
      "\n" +
      "8. Advance amount not refundable. Not applicable for another event." +
      "\n" +
      "9. Advance 50,000/- wedding day 1,00,000/- album printing day 40,000/-." +
      "\n" +
      "10. Stay and food Allowances client only Accommodate." +
      "\n",
  );
  const MIN_HEIGHT = 10 * 20;
  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowContainer}>
        <Pressable
          hitSlop={10}
          style={styles.backButton}
          onPress={() => {
            router.back();
          }}
        >
          <Image
            source={require("../assets/images/back_button.png")}
            style={{ width: 32, height: 32 }}
          />
        </Pressable>
        <Text style={styles.title}>{selectedEvent?.title}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.eventtitle}>Client Details</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={"Enter Client Name"}
          style={styles.input}
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder={"Enter mobile number"}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={"Enter Client Email"}
          style={styles.input}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.eventtitle}>Terms and Conditions</Text>
        <TextInput
          value={terms}
          onChangeText={setTerms}
          placeholder="Enter Terms and Conditions"
          multiline
          textAlignVertical="top" // IMPORTANT for Android
          onContentSizeChange={(e) => {
            setInputHeight(
              Math.max(MIN_HEIGHT, e.nativeEvent.contentSize.height),
            );
          }}
          style={[styles.input, { height: inputHeight }]}
        />
      </View>
      <Pressable
        onPress={() => {
          if (!name || !email || !phone) {
            Alert.alert("Error", "Please fill all client details");
            return;
          } else {
            addclientdetails(selectedEvent?.id || "", {
              name,
              email,
              mobileNumber: phone,
              saved: true,
            });
            addTerms(selectedEvent?.id || "", terms);
          }
          router.push("/pdfpreview");
        }}
        style={({ pressed }) => [
          styles.button,
          {
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <Text style={styles.text}>Preview PDF</Text>
      </Pressable>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    alignContent: "center",
    flex: 1,
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
  confirmbutton: {
    backgroundColor: "#C89B3C",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 10,
    backgroundColor: "lightgray",
    borderRadius: 10,
    overflow: "hidden",
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    width: 24,
    height: 24,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    paddingEnd: 44,
    fontWeight: "700",
    color: "#C89B3C",
  },

  grid: {
    flexDirection: "column",
    paddingHorizontal: 12,
    paddingBottom: 120,
    flex: 1,
  },
  eventtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  expandedView: {
    overflow: "visible",
  },
  collapsedView: {
    maxHeight: 0,
    overflow: "hidden",
  },
  eventdescription: {
    fontSize: 14,
    color: "#333",
  },
  dropdown: {
    borderColor: "#C89B3C",
    minHeight: 48,
  },

  dropdownContainer: {
    borderColor: "#C89B3C",
  },
  input: {
    borderWidth: 1,
    backgroundColor: "#fff",
    borderColor: "#000000",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
});
