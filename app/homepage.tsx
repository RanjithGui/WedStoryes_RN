import InputDialog from "@/components/inputdialog";
import { EventItem } from "@/types/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalStore } from "../store/globalstore";

export default function Homepage() {
  const router = useRouter();

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [deleteIndex, setDeleteIndex] = useState<number>(-1);
  const canGoBack = router.canGoBack();

  const onProceed = () => {
    if (selectedIndex === -1) {
      Alert.alert("Please select the Event");
      return;
    }
    router.push("/eventdetailsscreen");
  };
  const events = useGlobalStore((s) => s.events);
  const selectEvent = useGlobalStore((s) => s.selectEventByIndex);
  const addCustomEvent = useGlobalStore((s) => s.addCustomEvent);
  const setSelectedEventItem = useGlobalStore((s) => s.setSelectedEventItem);
  const [showDialog, setShowDialog] = useState(false);

  const renderItem = ({ item, index }: { item: EventItem; index: number }) => {
    const isSelected = selectedIndex === index;
    const showDelete = deleteIndex === index && item.id === item.title;

    return (
      <View style={styles.itemContainer}>
        <Pressable
          onPress={() => {
            setSelectedIndex(index);
            if (item.id === "customevent") {
              setShowDialog(true);
              // Alert.prompt("Custom Event", "Enter event name", (text) => {
              //   if (text) {
              //     const newEvent = {
              //       id: text,
              //       title: text,
              //       videoUri: require("../assets/gifs/customevent.gif"),
              //       eventDetails: [],
              //     };
              //     addCustomEvent(newEvent);
              //     setSelectedEventItem(newEvent);

              //     const updatedEvents = useGlobalStore.getState().events;
              //     const newEventIndex = updatedEvents.findIndex(
              //       (e) => e.id === text,
              //     );
              //     setSelectedIndex(newEventIndex);
              //     onProceed();
              //   }
              // });
            }
          }}
          onLongPress={() => {
            if (item.id === item.title) {
              setDeleteIndex(index);
            } else {
              Alert.alert("You can't delete default events");
            }
          }}
          style={[styles.card, isSelected && styles.selectedBorder]}
        >
          <Image source={item.videoUri} style={styles.gif} />

          {showDelete && (
            <Pressable
              style={styles.deleteButton}
              onPress={() => setDeleteIndex(-1)}
            >
              <Image
                source={require("../assets/gifs/delete.gif")}
                style={styles.deleteIcon}
              />
            </Pressable>
          )}
        </Pressable>

        <Text style={styles.itemText}>{item.title}</Text>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        hitSlop={10}
        style={styles.backButton}
        onPress={() => {
          console.log("first");
          router.back();
        }}
      >
        <Image
          source={require("../assets/images/back_button.png")}
          style={{ width: 32, height: 32 }}
        />
      </Pressable>

      {/* Grid */}
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id ?? ""}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />

      {/* Bottom Button */}
      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
          styles.proceedButton,
          selectedIndex === -1 && styles.disabled,
        ]}
        onPress={onProceed}
      >
        <Text style={styles.proceedText}>
          {selectedIndex === -1 ? "Select Event Type" : "Proceed"}
        </Text>
      </Pressable>
      <InputDialog
        visible={showDialog}
        title="Add Event"
        placeholder="Enter Event name"
        datapicker={false}
        onCancel={() => setShowDialog(false)}
        onOk={({ name, date }) => {
          console.log("Event Added: ", name);
          const newEvent = {
            id: name,
            title: name,
            videoUri: require("../assets/gifs/customevent.gif"),
            eventDetails: [],
          };
          addCustomEvent(newEvent);
          setSelectedEventItem(newEvent);

          const updatedEvents = useGlobalStore.getState().events;
          const newEventIndex = updatedEvents.findIndex((e) => e.id === name);
          setSelectedIndex(newEventIndex);
          setShowDialog(false);
          onProceed();
        }}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 44,
  },

  backIcon: {
    width: 24,
    height: 24,
  },

  grid: {
    paddingHorizontal: 12,
    paddingBottom: 120,
  },

  itemContainer: {
    flex: 1,
    margin: 16,
  },

  card: {
    aspectRatio: 2,
    borderRadius: 10,
    overflow: "hidden",
  },

  selectedBorder: {
    borderWidth: 2,
    borderColor: "#C89B3C",
  },

  gif: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  deleteButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    backgroundColor: "white",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  deleteIcon: {
    width: 20,
    height: 20,
  },

  itemText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    fontStyle: "italic",
    color: "#C89B3C",
    marginTop: 6,
  },

  proceedButton: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: "#C89B3C",
    paddingVertical: 14,
    borderRadius: 8,
  },

  disabled: {
    backgroundColor: "#999",
  },

  proceedText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
function usePathname(): any {
  throw new Error("Function not implemented.");
}
