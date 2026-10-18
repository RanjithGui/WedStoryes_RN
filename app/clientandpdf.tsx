import ResponsiveContainer from "@/components/ResponsiveContainer";
import { DEFAULT_TERMS, STUDIO_OWNER } from "@/constants/quotation";
import { useGlobalStore } from "@/store/globalstore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
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
  const addTotalPriceandDiscount = useGlobalStore(
    (s) => s.addTotalPriceandDiscount,
  );
  const [photobook, setPhotobook] = useState(Boolean(false));
  const selectedEventDetails = selectedEvent?.eventDetails || [];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [terms, setTerms] = useState(DEFAULT_TERMS);
  const MIN_HEIGHT = 10 * 20;
  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT);
  useEffect(() => {
    if (selectedEvent?.clientDetails?.name)
      setName(selectedEvent.clientDetails.name);
    if (selectedEvent?.clientDetails?.email)
      setEmail(selectedEvent.clientDetails.email);
    if (selectedEvent?.clientDetails?.mobileNumber)
      setPhone(selectedEvent.clientDetails.mobileNumber);
    if (selectedEvent?.totalPrice) setPrice(selectedEvent.totalPrice);
    if (selectedEvent?.totalDiscount) setDiscount(selectedEvent.totalDiscount);
    if (selectedEvent?.termsAndConditions)
      setTerms(selectedEvent.termsAndConditions);
  }, [selectedEvent]);

  return (
    <SafeAreaView style={styles.container}>
      <ResponsiveContainer maxWidth={640} style={styles.responsiveBody}>
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
        <ScrollView>
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
            <Text style={styles.eventtitle}>Client Details</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder={"Enter Total Price"}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              value={discount}
              onChangeText={setDiscount}
              placeholder={"Enter Discount"}
              keyboardType="numeric"
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
              } else if (!price || !discount) {
                Alert.alert("Error", "Please fill price and discount");
                return;
              } else {
                addclientdetails(
                  selectedEvent?.id || "",
                  {
                    name,
                    email,
                    mobileNumber: phone,
                    saved: true,
                  },
                  STUDIO_OWNER,
                );
                addTerms(selectedEvent?.id || "", terms);
                addTotalPriceandDiscount(
                  selectedEvent?.id || "",
                  price,
                  discount,
                );
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
        </ScrollView>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    alignContent: "center",
    flex: 1,
  },
  responsiveBody: {
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
