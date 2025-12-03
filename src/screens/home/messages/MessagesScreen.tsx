// MessagesScreen.tsx
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Colors } from "colors";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const MessagesScreen: React.FC = () => {
    const navigation = useNavigation();


  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={30} color={"#000"} />
        </TouchableOpacity>
        <Text style={styles.title}>Helmi Ben Abdelghani</Text>
      </View>

      {/* Messages (static) */}
      <ScrollView style={styles.messages} contentContainerStyle={{ paddingVertical: 12 }}>
        <View style={[styles.bubble, styles.bubbleIncoming]}>
          <Text style={styles.bubbleText}>Hey Helmi, how’s the new project?</Text>
          <Text style={styles.meta}>12:01</Text>
        </View>

        <View style={[styles.bubble, styles.bubbleOutgoing]}>
          <Text style={[styles.bubbleText, { color: "#fff" }]}>Going well! Just polishing the UI.</Text>
          <Text style={[styles.meta, { color: "#e6e6e6" }]}>12:02</Text>
        </View>

        <View style={[styles.bubble, styles.bubbleIncoming]}>
          <Text style={styles.bubbleText}>Nice. Let’s ship a first draft today.</Text>
          <Text style={styles.meta}>12:03</Text>
        </View>
      </ScrollView>

      {/* Input row (static, no logic) */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#9aa0a6"
        />
        <TouchableOpacity style={styles.sendBtn}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#202124",
    alignSelf: "center",
  },
  messages: {
    flex: 1,
    paddingHorizontal: 12,
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginVertical: 6,
    elevation: 0,
  },
  bubbleIncoming: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  bubbleOutgoing: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primaryGreen,
  },
  bubbleText: {
    fontSize: 15,
    color: "#202124",
  },
  meta: {
    marginTop: 4,
    fontSize: 11,
    color: "#6b7280",
    textAlign: "right",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
    color: "#202124",
  },
  sendBtn: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primaryGreen,
  },
  sendText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
