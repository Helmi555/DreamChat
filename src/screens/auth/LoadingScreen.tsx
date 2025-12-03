import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Text, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp } from "@react-navigation/native";
import { Colors } from "colors";
import AnimatedDots from "features/shared/components/elements/AnimatedDots";
import { useUser } from "context/UserContext";
import { User } from "types/User";
import firebase from "configs/firebase"; // your compat init file

const { width, height } = Dimensions.get("window");
const rememberedUserKey = "rememberedUser";

interface LoadingScreenProps {
  navigation: {
    replace: (screen: string) => void;
  };
}

const WhatsAppLogo = ({ size = 120 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="12" fill={Colors.primaryGreen} />
    <Path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"
      fill="#FFFFFF"
      fillRule="evenodd"
    />
  </Svg>
);

export default function LoadingScreen({ navigation }: LoadingScreenProps) {
  const { setCurrentUser } = useUser();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Animation sequence
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }),
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ),
  ]).start();
  
useEffect(() => {
  const bootstrap = async () => {
    // 1️⃣ Load remembered user from AsyncStorage (offline)
    const storedUserStr = await AsyncStorage.getItem(rememberedUserKey);
    const storedUser: User | null = storedUserStr ? JSON.parse(storedUserStr) : null;

    if (storedUser) {
      setCurrentUser(storedUser); // use offline remembered user
      console.log("Loaded remembered user:", storedUser.email);
      navigation.replace("Home"); // skip login
      return;
    }

    // 2️⃣ Wait for splash
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    // 3️⃣ Check Firebase Auth
    const currentAuthUser = firebase.auth().currentUser;
    if (currentAuthUser) {
      // Listen for realtime DB updates
      const profileRef = firebase.database().ref(`profiles/${currentAuthUser.uid}`);
      profileRef.on("value", async (snapshot) => {
        const profileData = snapshot.val() as User;
        if (profileData) {
          setCurrentUser(profileData);
          await AsyncStorage.setItem(rememberedUserKey, JSON.stringify(profileData));
        }
      });

      navigation.replace("Home");
    } else {
      console.info("No authenticated user, going to Login");
      navigation.replace("Login");
    }
  };

  bootstrap();
}, [navigation]);


  return (
    <LinearGradient
      // Green gradient background
      colors={[Colors.primaryGreen, Colors.successGreen]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Main Content */}
      <View style={styles.content}>
        <WhatsAppLogo size={140} />

        <View style={styles.textContainer}>
          <Animated.View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 0,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "300",
                fontStyle: "italic",
                fontSize: 32,
              }}
            >
              Dream{" "}
            </Text>
            <Text
              style={{
                color: Colors.filterActiveBg,
                fontWeight: "800",
                fontSize: 34,
              }}
            >
              CHAT
            </Text>
          </Animated.View>
          <AnimatedDots />
        </View>
      </View>

      <View style={styles.securityBadge}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path
            d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM16 10.8L11 15.8L8 12.8L9.4 11.4L11 13L14.6 9.4L16 10.8Z"
            fill="#FFFFFF"
            fillOpacity={0.8}
          />
        </Svg>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    marginBottom: 100,
  },
  textContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  securityBadge: {
    position: "absolute",
    bottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
});
