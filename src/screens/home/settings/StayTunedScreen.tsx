import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from "react-native";
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { Colors } from "colors"; // Adjust import path as needed
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  StayTuned: { screenTitle: string };
};

type StayTunedScreenRouteProp = RouteProp<RootStackParamList, 'StayTuned'>;

type StayTunedScreenProps = {
  route?: RouteProp<any, any>; 
};


const StayTunedScreen: React.FC<StayTunedScreenProps> = ({ route }) => {
  const { screenTitle } = route?.params || { screenTitle: "This Feature" };
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -20,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleCancel} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{screenTitle?screenTitle:"Coming Soon"}</Text>
        
        <View style={{ width: 24 }} />
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Background gradient circles */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        {/* Animated SVG Icon */}
        <Animated.View
          style={{
            transform: [{ translateY: floatAnim }, { rotate: spin }],
            marginBottom: 40,
          }}
        >
          <Svg width="140" height="140" viewBox="0 0 120 120">
            <Defs>
              <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop
                  offset="0%"
                  stopColor={Colors.primaryGreen}
                  stopOpacity="1"
                />
                <Stop
                  offset="100%"
                  stopColor={Colors.successGreen}
                  stopOpacity="1"
                />
              </LinearGradient>
            </Defs>

            {/* Outer circle */}
            <Circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="3"
              opacity="0.3"
            />

            {/* Cooking pot */}
            <Path
              d="M 35 50 Q 35 45 40 45 L 80 45 Q 85 45 85 50 L 85 75 Q 85 85 75 85 L 45 85 Q 35 85 35 75 Z"
              fill="url(#grad1)"
            />

            {/* Steam bubbles */}
            <Circle
              cx="50"
              cy="35"
              r="4"
              fill={Colors.primaryGreen}
              opacity="0.6"
            />
            <Circle
              cx="60"
              cy="28"
              r="5"
              fill={Colors.primaryGreen}
              opacity="0.7"
            />
            <Circle
              cx="70"
              cy="33"
              r="4"
              fill={Colors.primaryGreen}
              opacity="0.6"
            />

            {/* Pot handle left */}
            <Path
              d="M 35 55 Q 25 55 25 60 Q 25 65 35 65"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="3"
            />

            {/* Pot handle right */}
            <Path
              d="M 85 55 Q 95 55 95 60 Q 95 65 85 65"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="3"
            />
          </Svg>
        </Animated.View>

        {/* Main title */}
        <Text style={styles.title}>Something's Cooking!</Text>
        <Text style={styles.subtitle}>We're preparing something amazing for you</Text>
        <Text style={styles.stayTuned}>Stay Tuned ✨</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  bgCircle1: {
    position: "absolute",
    top: "15%",
    left: "-10%",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.filterActiveBg,
    opacity: 0.4,
  },
  bgCircle2: {
    position: "absolute",
    bottom: "15%",
    right: "-10%",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.badgeGreen,
    opacity: 0.3,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primaryGreen,
    marginBottom: 16,
    textAlign: "center",
    textShadowColor: Colors.filterActiveBg,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  stayTuned: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.successGreen,
    marginTop: 8,
    textAlign: "center",
  },
});

export default StayTunedScreen;