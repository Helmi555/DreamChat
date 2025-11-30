// ChatItem.tsx
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React from "react";
import { Discussion } from "types/Chat";
import { User } from "types/User";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import CircleAvatar from "features/shared/components/elements/CircleAvatar";

interface ChatItemProps {
  discussion: Discussion;
  otherUser: User | null; 
  onPress?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  discussion,
  otherUser,
  onPress,
}) => {
  const chatName = otherUser
    ? `${otherUser.name} ${otherUser.lastName || ""}`
    : "Unknown";

  const lastMessage = Object.values(discussion.messages).pop();
  const isUnread =
    lastMessage &&
    lastMessage.timestamp > (discussion.lastMessageTimestamp || 0);

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

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {otherUser?.profileImageUrl ? (
        <Image
          source={{ uri: otherUser.profileImageUrl }}
          style={styles.avatar}
        />
      ) : (
        <View style={{ marginRight: 12 }} >
        <CircleAvatar letter={otherUser?.name?.[0] || "?"} size={50}  />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={[isUnread && styles.unreadMessage, styles.chatName]}>
          {chatName}
        </Text>
        <Text style={[styles.lastMessage, isUnread && styles.unreadMessage]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {lastMessage?.messageBody || "No messages yet"}
        </Text>
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
  textContainer: {
    flex: 1,
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
});
