import { useGlobalStore } from "@/store/globalstore";
import client from "@/src/apolloclient";
import { hideSplash } from "@/utils/hideSplash";
import { ApolloProvider } from "@apollo/client/react";
import { Slot, Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

const storeHydrated = () =>
  new Promise<void>((resolve) => {
    if (useGlobalStore.persist.hasHydrated()) resolve();
    else useGlobalStore.persist.onFinishHydration(() => resolve());
  });

export default function RootLayout() {
  useEffect(() => {
    hideSplash(storeHydrated());
  }, []);

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
