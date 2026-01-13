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
import { useGlobalStore } from "../store/globalstore";


export default function Homepage() {
     const router = useRouter();

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [deleteIndex, setDeleteIndex] = useState<number>(-1);

  const onProceed = () => {
    if (selectedIndex === -1) {
      Alert.alert("Please select the Event");
      return;
    }
  //  router.push("/next-screen");
  };
//     const EVENTS: EventItem[] = [
//   { id: "wedding", title: "Wedding", thumbnail: require("../assets/gifs/wedding.gif") },
//   { id: "engagement", title: "Engagement", thumbnail: require("../assets/gifs/corporate.gif") },
//   { id: "birthday", title: "Birthday", thumbnail: require("../assets/gifs/birthday.gif") },
//   { id: "corporate", title: "Corporate", thumbnail: require("../assets/gifs/babyshower.gif") },
//   { id: "customevent", title: "Custom Event", thumbnail: require("../assets/gifs/customevent.gif") },
// ];
  const events = useGlobalStore((s) => s.events);
  const selectEvent = useGlobalStore((s) => s.selectEventByIndex);



     const renderItem = ({ item, index }: { item: EventItem; index: number }) => {
    const isSelected = selectedIndex === index;
    const showDelete = deleteIndex === index && item.id === item.title;

    return (
      <View style={styles.itemContainer}>
        <Pressable
          onPress={() => {
            setSelectedIndex(index);
            if (item.id === "customevent") {
              Alert.prompt(
                "Custom Event",
                "Enter event name",
                (text) => {
                  if (text) {
                    setSelectedIndex(index);
                    onProceed();
                  }
                }
              );
            }
          }}
          onLongPress={() => {
            if (item.id === item.title) {
              setDeleteIndex(index);
            } else {
              Alert.alert("You can't delete default events");
            }
          }}
          style={[
            styles.card,
            isSelected && styles.selectedBorder,
          ]}
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
    <View style={styles.container}>
      {/* Back Button */}
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Image
          source={require("../assets/images/back_button.png")}
          style={styles.backIcon}
        />
      </Pressable>

      {/* Grid */}
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?? ""}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />

      {/* Bottom Button */}
      <Pressable
        style={[
          styles.proceedButton,
          selectedIndex === -1 && styles.disabled,
        ]}
        onPress={onProceed}
      >
        <Text style={styles.proceedText}>
          {selectedIndex === -1 ? "Select Event Type" : "Proceed"}
        </Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  back: {
    marginTop: 54,
    marginLeft: 26,
    marginBottom: 12,
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

