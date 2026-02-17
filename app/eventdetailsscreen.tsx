import InputDialog from "@/components/inputdialog";
import { useGlobalStore } from "@/store/globalstore";
import { SubEventDetails } from "@/types/types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
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
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string[]>([]);
  const [items, setItems] = useState([
    { label: "Drone", value: "drone" },
    { label: "Albums", value: "albums" },
    { label: "Led Screen", value: "ledscreens" },
    { label: "Live Streaming", value: "livestreaming" },
    { label: "Makeup Artist", value: "makeupartist" },
    { label: "Decorations", value: "decorations" },
    { label: "Invitations", value: "invitations" },
  ]);
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
  const updateAddonsCount = useGlobalStore((s) => s.updateAddonsCount);
  const getAddonCount = (addon: string) => {
    switch (addon) {
      case "drone":
        return subEvent?.addons?.drone ?? 0;
      case "albums":
        return subEvent?.addons?.albums ?? 0;
      case "ledscreens":
        return subEvent?.addons?.ledscreens ?? 0;
      case "livestreaming":
        return subEvent?.addons?.livestreaming ?? 0;
      case "makeup":
        return subEvent?.addons?.makeupartist ?? 0;
      case "decorations":
        return subEvent?.addons?.decorations ?? 0;
      case "invitations":
        return subEvent?.addons?.invitations ?? 0;
      default:
        return 0;
    }
  };
  const deleteSubEvent = useGlobalStore((s) => s.deletesubEvent);
  const deleteEvent = () => {
    Alert.alert(
      "Delete Sub-Event",
      "Are you sure you want to delete this sub-event?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteSubEvent(),
        },
      ],
      { cancelable: true },
    );
  };

  function handleDeleteSubEvent() {
    deleteSubEvent(eventid, subEventIndex);
  }

  return (
    <Pressable
      style={[styles.card, { zIndex: 1000 - subEventIndex }]}
      onPress={() => setIsExpanded(!isExpanded)}
    >
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.eventtitle}>{subEvent?.subEvent}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => {
              console.log(" first delete");
              deleteEvent();
            }}
          >
            <Image
              source={require("../assets/images/bin.png")}
              style={{ width: 18, height: 18 }}
            />
          </Pressable>

          <View style={{ width: 16 }} />
          <Image
            source={
              isExpanded
                ? require("../assets/images/up-arrow.png")
                : require("../assets/images/arrow-down.png")
            }
            style={{ width: 18, height: 18 }}
          />
        </View>
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

        {value.length >= 0 && (
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
            <View style={{ zIndex: 3000 }}>
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                multiple
                placeholder="Select Addons"
                mode="BADGE"
                listMode="MODAL"
                modalTitle="Select Addons"
                modalAnimationType="slide"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>

            <FlatList
              style={{ marginTop: 16 }}
              data={value}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 8,
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.eventdescription}>{item}</Text>
                  <Counter
                    value={getAddonCount(item)}
                    min={0}
                    step={1}
                    onChange={(count) => {
                      updateAddonsCount(
                        newEventIndex,
                        subEventIndex,
                        item,
                        count,
                      );
                    }}
                  />
                </View>
              )}
            />
          </View>
        )}
      </View>
    </Pressable>
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
        onPress={() => {
          router.push("/clientandpdf");
        }}
        style={({ pressed }) => [
          styles.confirmbutton,
          {
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <Text style={styles.text}>Continue</Text>
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
});
