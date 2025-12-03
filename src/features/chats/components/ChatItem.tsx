// ChatItem.tsx
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React from "react";
import { Discussion } from "types/Chat";
import { User } from "types/User";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import CircleAvatar from "features/shared/components/elements/CircleAvatar";
import AnimatedDots from "features/shared/components/elements/AnimatedDots"; // Import the typing animation component
import { Colors } from "colors";
import TypingAnimatedDots from "features/shared/components/elements/TypingAnimatedDots";

interface ChatItemProps {
  discussion: Discussion;
  otherUser: User | null;
  isUnread: boolean;
  onPress?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  discussion,
  otherUser,
  isUnread = true,
  onPress,
}) => {
  const chatName = otherUser
    ? otherUser.name ?otherUser.lastName?`${otherUser.name} ${otherUser.lastName}`:`${otherUser.name}`:otherUser?.pseudo?otherUser.pseudo:otherUser.email
    : "Unknownnnn"

  const lastMessage = discussion.messages
    ? Object.values(discussion.messages).pop()
    : null;

  let timeText = "";
  if (lastMessage?.timestamp) {
    const ts = new Date(lastMessage.timestamp);
    if (isToday(ts)) {
      timeText = ts.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (isYesterday(ts)) {
      timeText = "Yesterday";
    } else if ((Date.now() - ts.getTime()) / (1000 * 60 * 60 * 24) < 7) {
      timeText = formatDistanceToNow(ts, { addSuffix: true });
    } else {
      timeText = format(ts, "dd/MM/yyyy");
    }
  }

  if (!otherUser) {
    return null; // or a placeholder
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        {otherUser?.profileImageUrl ? (
          <Image
            source={{ uri: otherUser.profileImageUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={{ marginRight: 12 }}>
            <CircleAvatar letter={otherUser?.name?.[0] || "?"} size={50} />
          </View>
        )}
        <View
          style={[
            styles.compactStatusBadge,
            {
              backgroundColor: otherUser.isActive
                ? Colors.primaryGreen
                : Colors.textSecondary,
            },
          ]}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={[isUnread && styles.unreadMessage, styles.chatName]}>
          {chatName}
        </Text>
        {discussion?.typing && discussion.typing[otherUser.id] ? (
          <View style={styles.typingIndicatorContainer}>
            <Text style={styles.typingText}>Typing</Text>
            <TypingAnimatedDots />
          </View>
        ) : (
          <Text
            style={[styles.lastMessage, isUnread && styles.unreadMessage]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {discussion.lastMessageSenderId &&
            discussion?.lastMessageSenderId === otherUser.id
              ? ""
              : "You: "}
            {lastMessage?.messageBody || "No messages yet"}
          </Text>
        )}
        {otherUser?.isActive && (
          <Text style={styles.activeStatus}>Active now</Text>
        )}
      </View>
      <View style={styles.rightContainer}>
        <Text style={[styles.timestamp, isUnread && styles.unreadMessage]}>
          {timeText}
        </Text>
        {isUnread && <View style={styles.unreadIndicator} />}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ChatItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    justifyContent: "space-between",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarContainer: {
    position: "relative", // Ensure the container is positioned relative for absolute positioning of the badge
  },
  textContainer: {
    flex: 1, // Ensure the text container takes up available space
  },
  chatName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 2,
    color: "#000",
  },
  lastMessage: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 6,
  },
  unreadMessage: {
    color: "#2ecc71",
    fontWeight: "700",
  },
  rightContainer: {
    alignItems: "flex-end",
    borderWidth: 0,
    justifyContent: "space-between",
    height: 40,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    fontWeight: "700",
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2ecc71",
  },
  typingIndicatorContainer: {
    flexDirection: "row",
  },
  typingText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    fontWeight: "500",
  },
  activeStatus: {
    marginTop: 4,
    fontSize: 12,
    color: "#2ecc71",
    fontWeight: "600",
  },
  compactStatusBadge: {
    position: "absolute",
    bottom: 2,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#2ecc71",
  },
});
