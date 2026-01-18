import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect } from "react";
import {
  Dimensions,
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

const { height } = Dimensions.get("window");

export default function Index() {
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

  const iconStyle = (jump: any) =>
    useAnimatedStyle(() => ({
      transform: [{ translateY: jump.value }],
    }));

  return (
    <View style={styles.container}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />

      <View style={styles.overlay}>
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
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
