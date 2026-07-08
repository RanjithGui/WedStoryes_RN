import ResponsiveContainer from "@/components/ResponsiveContainer";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect } from "react";
import {
  AppState,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export default function landingPage() {
  const router = useRouter();

  const jump1 = useSharedValue(0);
  const jump2 = useSharedValue(0);
  const jump3 = useSharedValue(0);
  const player = useVideoPlayer(
    require("../assets/videos/bgvideo.mp4"),
    (player) => {
      player.loop = true;
      player.muted = true;
      player.play();
    },
  );

  useEffect(() => {
    jump1.value = withRepeat(withTiming(-18, { duration: 400 }), -1, true);
    setTimeout(() => {
      jump2.value = withRepeat(withTiming(-18, { duration: 400 }), -1, true);
    }, 400);
    setTimeout(() => {
      jump3.value = withRepeat(withTiming(-18, { duration: 400 }), -1, true);
    }, 800);
  }, []);

  // On web, expo-video's setup() callback fires before the <video> element
  // mounts, so the initial player.play() call has no video to act on yet.
  // Re-issue it once VideoView has actually mounted the element.
  useEffect(() => {
    player.play();
  }, [player]);

  // Browsers (and mobile OSes) commonly pause background media to save
  // power - switching tabs away and back, or backgrounding the app, can
  // leave the player paused on a frozen frame. Resume it as soon as we're
  // foregrounded again so it picks up smoothly instead of staying stuck.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        player.play();
      }
    });
    return () => subscription.remove();
  }, [player]);

  const iconStyle = (jump: any) =>
    useAnimatedStyle(() => ({
      transform: [{ translateY: jump.value }],
    }));

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
        playsInline
      />

      <ResponsiveContainer maxWidth={480} style={styles.overlay}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />

        <View style={styles.centerContent}>
          <View style={styles.iconRow}>
            <Animated.Image
              source={require("../assets/images/camera.png")}
              style={[styles.iconLarge, iconStyle(jump1)]}
            />
            <Animated.Image
              source={require("../assets/images/heart_icon.png")}
              style={[styles.iconSmall, iconStyle(jump2)]}
            />
            <Animated.Image
              source={require("../assets/images/camera.png")}
              style={[styles.iconLarge, iconStyle(jump3)]}
            />
          </View>

          <Text style={styles.title}>Capture Your Perfect Moments</Text>

          <Text style={styles.subtitle}>
            Professional photography and videography services for weddings,
            events, and special occasions.
          </Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => {
            console.log(" screen");
            router.push("/homepage");
          }}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </ResponsiveContainer>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  video: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    padding: 16,
  },

  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginTop: 40,
    resizeMode: "contain",
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  iconLarge: {
    width: 44,
    height: 44,
    marginHorizontal: 15,
  },

  iconSmall: {
    width: 28,
    height: 28,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#C89B3C",
  },

  subtitle: {
    textAlign: "center",
    color: "white",
    fontWeight: "600",
    marginTop: 8,
    paddingHorizontal: 16,
  },

  button: {
    backgroundColor: "#C89B3C",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 32,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
