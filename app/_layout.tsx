import client from "@/src/apolloclient";
import { ApolloProvider } from "@apollo/client/react";
import { Slot, Stack } from "expo-router";
import { Platform } from "react-native";

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      {/* Web pages scroll the document itself (needed for sticky headers and
          the scroll-driven landing hero), so skip the native stack's
          full-screen, overflow-clipped screen containers there. */}
      {Platform.OS === "web" ? (
        <Slot />
      ) : (
        <Stack screenOptions={{ headerShown: false }} />
      )}
    </ApolloProvider>
  );
}
