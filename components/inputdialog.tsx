import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type InputDialogProps = {
  visible: boolean;
  datapicker?: boolean;
  title: string;
  placeholder?: string;
  onCancel: () => void;
  onOk: (value: { name: string; date: Date }) => void;
};

export default function InputDialog({
  visible,
  title,
  datapicker = false,
  placeholder,
  onCancel,
  onOk,
}: InputDialogProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const onDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setShowPicker(false);
  };

  const toInputDateValue = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const onWebDateChange = (e: any) => {
    const value: string = e.target.value;
    if (!value) return;
    const [year, month, day] = value.split("-").map(Number);
    setDate(new Date(year, month - 1, day));
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>

          {/* Text Input */}
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={placeholder}
            style={styles.input}
          />

          {/* Date Selector */}
          {datapicker &&
            (Platform.OS === "web"
              ? React.createElement("input", {
                  type: "date",
                  value: toInputDateValue(date),
                  onChange: onWebDateChange,
                  style: webDateInputStyle,
                })
              : (
                  <Pressable
                    style={styles.dateField}
                    onPress={() => setShowPicker(true)}
                  >
                    <Text style={styles.dateText}>{date.toDateString()}</Text>
                  </Pressable>
                ))}

          {showPicker && Platform.OS !== "web" && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
            />
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.actionButton}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (!name.trim()) return;
                onOk({ name: name.trim(), date });
                setName("");
                setDate(new Date());
              }}
              style={styles.actionButton}
            >
              <Text style={styles.ok}>OK</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const webDateInputStyle: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ccc",
  color: "#333",
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
  width: "100%",
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  dialog: {
    width: "85%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  actionButton: {
    marginLeft: 20,
  },
  cancel: {
    color: "#777",
    fontSize: 16,
  },
  ok: {
    color: "#C89B3C",
    fontSize: 16,
    fontWeight: "600",
  },
  dateField: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dateText: {
    color: "#333",
  },
});
