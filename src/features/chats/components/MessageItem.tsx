import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Colors } from "colors";
import { Message } from "types/Chat";
import { User } from "types/User";
import CircleAvatar from "features/shared/components/elements/CircleAvatar";
import { Ionicons } from "@expo/vector-icons";

interface MessageItemProps {
  message: Message;
  isSender: boolean;
  senderProfileImage?: string;
  receiverProfileImage?: string;
  secondUserName: string;
  seen?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isSender,
  secondUserName,
  receiverProfileImage,
  seen,
}) => {
  return (
    <View
      style={[
        styles.messageContainer,
        isSender ? styles.senderContainer : styles.receiverContainer,
      ]}
    >
      {!isSender && (
        <View style={styles.avatarContainer}>
          {receiverProfileImage ? (
            <Image
              source={{ uri: receiverProfileImage }}
              style={styles.avatar}
            />
          ) : (
            <CircleAvatar letter={secondUserName.charAt(0)} size={30} />
          )}
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isSender ? styles.senderBubble : styles.receiverBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isSender ? styles.senderText : styles.receiverText,
          ]}
        >
          {message.messageBody}
        </Text>
        <View style={styles.rightContainer}> 
          <Text
            style={[
              styles.timestamp,
              { color: isSender ? "#ffffffff" : "#555" },
            ]}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {isSender&& seen && (
            <Ionicons
              style={styles.seenIndicator}
              name="checkmark-done"
              size={16}
              color={Colors.primaryBlue}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default MessageItem;

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
  },
  senderContainer: {
    justifyContent: "flex-end",
  },
  receiverContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 10,
    borderTopRightRadius: 14,
    borderTopLeftRadius: 14,
  },
  senderBubble: {
    backgroundColor: Colors.primaryGreen,
    alignSelf: "flex-end",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 2,
  },
  receiverBubble: {
    backgroundColor: "#f1f1f1",
    alignSelf: "flex-start",
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
  },
  senderText: {
    color: "#fff",
  },
  receiverText: {
    color: "#000",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },
  seenIndicator: {
    textAlign: "center",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent:"flex-end",
    gap:4,
    borderWidth:0
  },
});
