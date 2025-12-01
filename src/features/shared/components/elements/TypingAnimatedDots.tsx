import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

const TypingAnimatedDots = () => {
  const dots = useRef([1, 2, 3].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dots[0], {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dots[1], {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dots[2], {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dots[0], {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dots[1], {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dots[2], {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dots[0], {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dots[1], {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dots[2], {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  return (
    <View style={styles.dotsContainer}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              opacity: dot,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    marginLeft: 4,
    marginBottom:2,
    gap:2
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#666",
    marginHorizontal: 1,
  },
});

export default TypingAnimatedDots;
