import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, Rect } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const WaveBackground = ({ children }: { children?: React.ReactNode }) => {
  const waveHeight = 80;

  return (
    <View style={styles.container}>
      <View style={styles.backgroundLayer}>
        <LinearGradient
          colors={["#39e37f", "#047857", "#02b29a"]}
          style={styles.gradient}
        />

        {/* Decorative shapes */}
        <Svg
          height={SCREEN_HEIGHT * 0.6}
          width={SCREEN_WIDTH}
          style={styles.decorativeShapes}
        >
          {/* Top right circles */}
          <Circle
            cx={SCREEN_WIDTH - 40}
            cy={80}
            r="35"
            fill="none"
            stroke="rgba(255,255,255,0.215)"
            strokeWidth="2"
          />
          <Circle
            cx={SCREEN_WIDTH - 45}
            cy={85}
            r="20"
            fill="none"
            stroke="rgba(255,255,255,0.21)"
            strokeWidth="1.5"
          />

          {/* Top left small circles */}
          <Circle cx={60} cy={120} r="12" fill="rgba(255,255,255,0.212)" />
          <Circle cx={35} cy={160} r="8" fill="rgba(255,255,255,0.208)" />

          {/* Middle left rounded rectangle */}
          <Path
            d={`M 20,${SCREEN_HEIGHT * 0.25} 
                L 65,${SCREEN_HEIGHT * 0.25} 
                L 65,${SCREEN_HEIGHT * 0.25 + 35} 
                L 20,${SCREEN_HEIGHT * 0.25 + 35} 
                Z
                M 20,${SCREEN_HEIGHT * 0.25}
                L 42.5,${SCREEN_HEIGHT * 0.25 + 18}
                L 65,${SCREEN_HEIGHT * 0.25}`}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Middle right circles */}
          <Circle
            cx={SCREEN_WIDTH - 70}
            cy={SCREEN_HEIGHT * 0.28}
            r="18"
            fill="none"
            stroke="rgba(255,255,255,0.21)"
            strokeWidth="2"
          />
          <Path
            d={`M ${SCREEN_WIDTH - 50},${SCREEN_HEIGHT * 0.32} 
      L ${SCREEN_WIDTH - 18},${SCREEN_HEIGHT * 0.32 + 3} 
      L ${SCREEN_WIDTH - 22},${SCREEN_HEIGHT * 0.32 + 22} 
      L ${SCREEN_WIDTH - 54},${SCREEN_HEIGHT * 0.32 + 19} 
      Z
      M ${SCREEN_WIDTH - 50},${SCREEN_HEIGHT * 0.32}
      L ${SCREEN_WIDTH - 36},${SCREEN_HEIGHT * 0.32 + 12}
      L ${SCREEN_WIDTH - 18},${SCREEN_HEIGHT * 0.32 + 3}`}
            fill="rgba(255,255,255,0.15)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>

        <Svg
          height={waveHeight}
          width={SCREEN_WIDTH}
          style={styles.wave}
          preserveAspectRatio="none"
          viewBox={`0 0 ${SCREEN_WIDTH} ${waveHeight}`}
        >
          <Path
            d={`
              M 0,0
              C ${SCREEN_WIDTH * 0.25},${waveHeight * 0.75}
                ${SCREEN_WIDTH * 0.75},${waveHeight * 0.45}
                ${SCREEN_WIDTH},${waveHeight}
              L ${SCREEN_WIDTH},${waveHeight}
              L 0,${waveHeight}
              Z
            `}
            fill="white"
          />
        </Svg>

        <View style={styles.bottomWhite} />
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  backgroundLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
  },
  gradient: {
    flex: 1,
  },
  decorativeShapes: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  wave: {
    position: "absolute",
    bottom: "40%",
    left: 0,
    right: 0,
  },
  bottomWhite: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "white",
  },
});

export default WaveBackground;
