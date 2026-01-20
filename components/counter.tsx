import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CounterProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
};

export default function Counter({
  value,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  onChange,
}: CounterProps) {
  const decrement = () => {
    const next = value - step;
    if (next >= min) onChange(next);
  };

  const increment = () => {
    const next = value + step;
    if (next <= max) onChange(next);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={decrement} style={styles.button}>
        <Text style={styles.symbol}>−</Text>
      </Pressable>

      <Text style={styles.value}>{value}</Text>

      <Pressable onPress={increment} style={styles.button}>
        <Text style={styles.symbol}>+</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#C89B3C",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  button: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: {
    fontSize: 22,
    fontWeight: "600",
    color: "#C89B3C",
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
  },
});
