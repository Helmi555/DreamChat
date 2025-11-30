import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CircleAvatarProps {
  letter?: string; // The letter to display (optional if imageUrl is provided)
  imageUrl?: string; // The URL of the profile image (optional)
  size?: number; // Diameter of the circle
  colors?: string[]; // Custom gradient colors (optional)
}

const defaultColors = [
  ["#FF6F61", "#FFB88C"], // Orange gradient
  ["#6A5ACD", "#836FFF"], // Purple gradient
  ["#20B2AA", "#66CDAA"], // Teal gradient
  ["#FF6347", "#FF7F50"], // Coral gradient
];

const CircleAvatar: React.FC<CircleAvatarProps> = ({
  letter,
  imageUrl,
  size = 50,
  colors,
}) => {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    );
  }

  // Generate a stable random index based on the letter
  const colorIndex = useMemo(
    () => Math.abs((letter?.charCodeAt(0) || 0) % defaultColors.length),
    [letter]
  );
  const gradientColors = colors || defaultColors[colorIndex];

  return (
    <LinearGradient
      colors={gradientColors as [string, string]}
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.letter, { fontSize: size / 2 }]}>
          {letter?.toUpperCase()}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  circle: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  letter: {
    fontWeight: "bold",
    color: "white",
  },
});

export default CircleAvatar;
