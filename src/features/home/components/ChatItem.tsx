// // ChatItem.tsx
// import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
// import React from "react";
// import { Chat, Group, User } from "types/User";
// import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";

// interface ChatItemProps {
//   item: Chat | Group;
//   currentUser: User;
//   usersMap: Record<string, User>; // For 1-to-1 name/avatar lookup
//   onPress?: () => void;
// }

// const ChatItem: React.FC<ChatItemProps> = ({ item, currentUser, usersMap, onPress }) => {
//   const isGroup = "memberIds" in item;
//   const lastRead = item.lastRead?.[currentUser.id] || 0;
//   const isUnread = (item.lastMessageTimestamp || 0) > lastRead;

//   // Determine chat name & avatar
//   let chatName = "";
//   let avatarUrl = "https://via.placeholder.com/50";
//   if (isGroup) {
//     chatName = item.name;
//   } else {
//     const otherUserId = item.participantIds.find(id => id !== currentUser.id)!;
//     const otherUser = usersMap[otherUserId];
//     chatName = otherUser ? `${otherUser.name} ${otherUser.lastName || ""}` : "Unknown";
//     avatarUrl = otherUser?.profileImageUrl || avatarUrl;
//   }

//   // Format timestamp
//   let timeText = "";
//   if (item.lastMessageTimestamp) {
//     const ts = new Date(item.lastMessageTimestamp);
//     if (isToday(ts)) timeText = ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//     else if (isYesterday(ts)) timeText = "Yesterday";
//     else if ((Date.now() - ts.getTime()) / (1000 * 60 * 60 * 24) < 7) {
//       timeText = formatDistanceToNow(ts, { addSuffix: true }); // e.g., "2 days ago"
//     } else timeText = format(ts, "dd/MM/yyyy");
//   }

//   return (
//     <TouchableOpacity style={styles.container} onPress={onPress}>
//       <Image source={{ uri: avatarUrl }} style={styles.avatar} />
//       <View style={styles.textContainer}>
//         <Text style={[styles.chatName, isUnread && styles.unreadMessage]}>
//           {chatName}
//         </Text>
//         <Text style={[styles.lastMessage, isUnread && styles.unreadMessage]}>
//           {item.lastMessageText || "No messages yet"}
//         </Text>
//       </View>
//       <View style={styles.rightContainer}>
//         <Text style={[styles.timestamp, isUnread && styles.unreadMessage]}>{timeText}</Text>
//         {isUnread && <View style={styles.unreadIndicator} />}
//       </View>
//     </TouchableOpacity>
//   );
// };

// export default ChatItem;

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 12,
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#ccc",
//     justifyContent: "space-between",
//   },
//   avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
//   textContainer: { flex: 1 },
//   chatName: { fontWeight: "600", fontSize: 16, marginBottom: 2 },
//   lastMessage: { color: "#666", fontSize: 14 },
//   unreadMessage: { color: "#2ecc71", fontWeight: "700" },
//   rightContainer: { alignItems: "flex-end" },
//   timestamp: { fontSize: 12, color: "#999", marginBottom: 4 },
//   unreadIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2ecc71" },
// });
