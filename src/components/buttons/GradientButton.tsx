import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  DimensionValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

interface GradientButtonProps {
  text?: string;
  onPress?: () => void;
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  colors?: readonly [string, string, ...string[]];
  loading?: boolean;
  disabled?: boolean;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconSize?: number;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  text = "Button",
  onPress,
  width = "100%",
  height = 50,
  borderRadius = 25,
  colors = ["#25D366", "#1EBE5D", "#0E9F4B"],
  loading = false,
  disabled = false,
  iconName,
  iconColor = "#fff",
  iconSize = 22,
  textStyle,
  containerStyle,
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    disabled={disabled || loading}
    onPress={onPress}
    style={[{ width, height, borderRadius }, containerStyle]}
  >
    <LinearGradient
      colors={disabled ? ["#9ca3af", "#6b7280"] : colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, { borderRadius, height, opacity: disabled ? 0.6 : 1 }]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
          {iconName && (
            <MaterialIcons
              name={iconName}
              color={iconColor}
              size={iconSize}
              style={styles.icon}
            />
          )}
        </>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  gradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#047857",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  icon: {
    marginLeft: 4,
  },
});

export default GradientButton;