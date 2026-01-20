import InputDialog from "@/components/inputdialog";
import { useGlobalStore } from "@/store/globalstore";
import { SubEventDetails } from "@/types/types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Counter from "../components/counter";

const EventDetailItem = ({
  eventid,
  subEventIndex,
}: {
  eventid: string;
  subEventIndex: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const subEvent = useGlobalStore(
    (s) =>
      s.events.find((e) => e.id === eventid)?.eventDetails?.[subEventIndex],
  );
  const newEventIndex = useGlobalStore((s) =>
    s.events.findIndex((e) => e.id === eventid),
  );

  const updatePhotoGraphersCount = useGlobalStore(
    (s) => s.updatePhotoGraphersCount,
  );
  const updateVideographersCount = useGlobalStore(
    (s) => s.updateVideographersCount,
  );

  return (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.eventtitle}>{subEvent?.subEvent}</Text>
        <Pressable
          onPress={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          <Image
            source={
              isExpanded
                ? require("../assets/images/up-arrow.png")
                : require("../assets/images/arrow-down.png")
            }
            style={{ width: 18, height: 18 }}
          />
        </Pressable>
      </View>
      <View style={isExpanded ? styles.expandedView : styles.collapsedView}>
        <Text style={styles.eventdescription}>{subEvent?.date}</Text>
        <View
          style={{
            backgroundColor: "white",
            padding: 8,
            borderRadius: 8,
            marginTop: 16,
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Text style={styles.eventtitle}>PhotoGraphers</Text>
          <View
            style={{
              flexDirection: "row",
              marginTop: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.eventdescription}>Traditional</Text>
            <Counter
              value={subEvent?.photographers?.traditional || 0}
              min={0}
              step={1}
              onChange={(value) => {
                updatePhotoGraphersCount(
                  newEventIndex,
                  subEventIndex,
                  "traditional",
                  value,
                );
                console.log(
                  "Traditional Photographers:",
                  useGlobalStore.getState().events.find((e) => e.id === eventid)
                    ?.eventDetails?.[subEventIndex]?.photographers,
                );
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              marginTop: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.eventdescription}>Candid</Text>
            <Counter
              value={subEvent?.photographers?.candid || 0}
              min={0}
              step={1}
              onChange={(value) => {
                updatePhotoGraphersCount(
                  newEventIndex,
                  subEventIndex,
                  "candid",
                  value,
                );
              }}
            />
          </View>
        </View>
        <View
          style={{
            backgroundColor: "white",
            padding: 8,
            borderRadius: 8,
            marginTop: 16,
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Text style={styles.eventtitle}>VideoGraphers</Text>
          <View
            style={{
              flexDirection: "row",
              marginTop: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.eventdescription}>Traditional</Text>
            <Counter
              value={subEvent?.videographers?.traditional || 0}
              min={0}
              step={1}
              onChange={(value) => {
                updateVideographersCount(
                  newEventIndex,
                  subEventIndex,
                  "traditional",
                  value,
                );
                console.log(
                  "Traditional Video:",
                  useGlobalStore.getState().events.find((e) => e.id === eventid)
                    ?.eventDetails?.[subEventIndex]?.videographers,
                );
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              marginTop: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.eventdescription}>Candid</Text>
            <Counter
              value={subEvent?.videographers?.candid || 0}
              min={0}
              step={1}
              onChange={(value) => {
                updateVideographersCount(
                  newEventIndex,
                  subEventIndex,
                  "candid",
                  value,
                );
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default function eventdetailsscreen() {
  const router = useRouter();
  const selectedEvent = useGlobalStore((s) =>
    s.events.find((e) => e.id === s.selectedEventId),
  );
  const selectedEventDetails = selectedEvent?.eventDetails || [];
  const [showDialog, setShowDialog] = useState(false);
  const updateEvent = useGlobalStore((s) => s.updateEvent);
  const addSubEvent = useGlobalStore((s) => s.addSubEvent);
  console.log("Selected Event:", selectedEvent);
  console.log("Selected Event Title:", selectedEvent?.title);

  const addevent = () => {
    setShowDialog(true);
  };

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
      <FlatList
        style={styles.grid}
        data={selectedEventDetails}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ index }) => (
          <EventDetailItem
            eventid={selectedEvent?.id || ""}
            subEventIndex={index}
          />
        )}
      />
      <Pressable
        onPress={() => {
          addevent();
        }}
        style={({ pressed }) => [
          styles.button,
          {
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <Text style={styles.text}>Add Event</Text>
      </Pressable>
      <Pressable
        onPress={() => {}}
        style={({ pressed }) => [
          styles.confirmbutton,
          {
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <Text style={styles.text}>Confirm</Text>
      </Pressable>
      <InputDialog
        visible={showDialog}
        title="Add Sub-Event"
        placeholder="Enter sub-event name"
        datapicker={true}
        onCancel={() => setShowDialog(false)}
        onOk={({ name, date }) => {
          console.log("Event Added: ", name);
          const newSubEvent: SubEventDetails = {
            subEvent: name,
            date: date.toDateString(),
          };
          //selectedEventDetails.push(newSubEvent);
          if (selectedEvent?.id) {
            addSubEvent(selectedEvent.id, newSubEvent);
          }
          setShowDialog(false);
        }}
      />
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
    marginHorizontal: 8,
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
    maxHeight: 1000,
    overflow: "hidden",
  },
  collapsedView: {
    maxHeight: 0,
    overflow: "hidden",
  },
  eventdescription: {
    fontSize: 14,
    color: "#333",
  },
});
