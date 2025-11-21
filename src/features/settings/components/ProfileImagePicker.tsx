import React, { useState } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ProfileImagePicker = ({imageUri}:{imageUri?:string}) => {

const handlePickImage = () => {
  // const randomId = Math.floor(Math.random() * 70) + 1; // Generate a random number between 1 and 70
  // setImageUri(`https://i.pravatar.cc/150?img=${randomId}`);
};

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
        <Image
          source={{
            uri: imageUri || "https://i.pravatar.cc/150?img=3",
          }}
          style={styles.image}
        />
        <View style={styles.cameraIconContainer}>
          <Ionicons name="camera" size={18} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.8)",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#04b97f",
    borderRadius: 14,
    padding: 5,
    borderWidth: 2,
    borderColor: "white",
  },
});

export default ProfileImagePicker;
