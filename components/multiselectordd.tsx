import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

export default function MultiSelectDropdown() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string[]>([]);
  const [items, setItems] = useState([
    { label: "Photography", value: "photo" },
    { label: "Videography", value: "video" },
    { label: "Drone", value: "drone" },
    { label: "Editing", value: "editing" },
  ]);

  return (
    <View style={styles.container}>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        multiple={true}
        min={0}
        max={5}
        placeholder="Select services"
        mode="BADGE"
        badgeDotColors={["#4CAF50"]}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    zIndex: 1000, // VERY IMPORTANT
  },
  dropdown: {
    borderColor: "#ccc",
  },
  dropdownContainer: {
    borderColor: "#ccc",
  },
});
