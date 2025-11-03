import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../colors";

const ListScreen: React.FC = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.backgroundLight,
      }}
    >
      <Text>Chats</Text>
    </View>
  );
};

const styles = StyleSheet.create({});

export default ListScreen;
