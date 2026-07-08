import React from "react";
import {
  StyleProp,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

type ResponsiveContainerProps = {
  children: React.ReactNode;
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Keeps mobile layouts untouched (width < maxWidth is a no-op) while
 * centering content and capping its width on wide/web viewports so
 * forms and grids don't stretch edge-to-edge on a desktop browser.
 */
export default function ResponsiveContainer({
  children,
  maxWidth = 640,
  style,
}: ResponsiveContainerProps) {
  const { width } = useWindowDimensions();
  const isCapped = width > maxWidth;

  return (
    <View
      style={[
        { width: "100%" },
        isCapped && { maxWidth, alignSelf: "center" },
        style,
      ]}
    >
      {children}
    </View>
  );
}
