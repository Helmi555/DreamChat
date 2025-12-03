// import React, { useState } from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
//   SectionList,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { Colors } from "colors";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useUser } from "context/UserContext";
// //import ChatItem from "features/home/components/ChatItem";
// import { Chat, Group, User } from "types/User";

// const users: User[] = [
//   {
//     id: "user1",
//     name: "Alice",
//     email: "alice@example.com",
//     pseudo: "alice123",
//     profileImageUrl: "https://i.pravatar.cc/150?img=1",
//   },
//   {
//     id: "user2",
//     name: "Bob",
//     email: "bob@example.com",
//     pseudo: "bobby",
//     profileImageUrl: "https://i.pravatar.cc/150?img=2",
//   },
//   {
//     id: "user3",
//     name: "Charlie",
//     email: "charlie@example.com",
//     pseudo: "charlieC",
//     profileImageUrl: "https://i.pravatar.cc/150?img=3",
//   },
// ];
// const groups: Group[] = [
//   {
//     id: "g1",
//     name: "Study Group",
//     memberIds: ["user1", "user2", "user3"],
//     createdBy: "user1",
//     createdAt: 1633000000000,
//     adminIds: ["user1"],
//     lastMessageText: "Let's meet tomorrow!",
//     lastMessageTimestamp: 1633194000000,
//     lastRead: {
//       user1: 1633194000000,
//       user2: 1633193800000,
//       user3: 1633193000000,
//     },
//   },
//   {
//     id: "g2",
//     name: "Work Team",
//     memberIds: ["user2", "user3"],
//     createdBy: "user2",
//     createdAt: 1633300000000,
//     adminIds: ["user2"],
//     lastMessageText: "Project deadline is next week.",
//     lastMessageTimestamp: 1633366800000,
//     lastRead: {
//       user2: 1633366800000,
//       user3: 1633366700000,
//     },
//   },
// ];

// const dummyChats: (Chat | Group)[] = [
//   {
//     id: "1",
//     participantIds: ["user1", "user2"],
//     lastMessageText: "Hey!",
//     lastMessageTimestamp: 1633024800000,
//     lastRead: {
//       user1: 1633024800000,
//       user2: 1633024700000,
//     },
//   },
//   {
//     id: "2",
//     participantIds: ["user3", "user4"],
//     lastMessageText: "Meeting tomorrow",
//     lastMessageTimestamp: 1633107600000,
//     lastRead: {
//       user3: 1633107600000,
//       user4: 1633107000000,
//     },
//   },
//   {
//     id: "4",
//     participantIds: ["user8", "user9"],
//     lastMessageText: "Got it",
//     lastMessageTimestamp: 1633280400000,
//     lastRead: {
//       user8: 1633280400000,
//       user9: 1633280300000,
//     },
//   },

//   {
//     id: "g1",
//     name: "Study Group",
//     memberIds: ["user5", "user6", "user7"],
//     createdBy: "user5",
//     createdAt: 1633000000000,
//     adminIds: ["user5"],
//     lastMessageText: "Project update",
//     lastMessageTimestamp: 1633194000000,
//     lastRead: {
//       user5: 1633194000000,
//       user6: 1633193800000,
//       user7: 1633193000000,
//     },
//   },
//   {
//     id: "g2",
//     name: "Welcome Team",
//     memberIds: ["user10", "user11", "user12"],
//     createdBy: "user10",
//     createdAt: 1633300000000,
//     adminIds: ["user10", "user11"],
//     lastMessageText: "Welcome to the group!",
//     lastMessageTimestamp: 1633366800000,
//     lastRead: {
//       user10: 1633366800000,
//       user11: 1633366700000,
//       user12: 1633366600000,
//     },
//   },
// ];

// const ChatsScreen: React.FC = () => {
//   const { currentUser } = useUser();
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState<"all" | "unread" | "groups">("all");

//   const filteredChats = dummyChats
//     .filter((chatOrGroup) => {
//       // Determine unread status
//       const isUnread =
//         (chatOrGroup.lastMessageTimestamp || 0) >
//         (chatOrGroup.lastRead?.[currentUser?.id || ""] || 0);

//       if (filter === "unread") return isUnread;

//       if (filter === "groups") {
//         // Type guard: only Groups have memberIds > 2
//         if ("memberIds" in chatOrGroup) {
//           return chatOrGroup.memberIds.length > 2;
//         }
//         return false;
//       }

//       return true;
//     })
//     .filter((chatOrGroup) => {
//       const lastText = chatOrGroup.lastMessageText?.toLowerCase() || "";
//       const searchLower = search.toLowerCase();
//       return lastText.includes(searchLower);
//     });

//   const sections = [
//     {
//       title: "Chats",
//       data: filteredChats,
//     },
//   ];
//   if (!currentUser) return null;

//   return (
//     <SafeAreaView style={styles.container} edges={["top"]}>
//       {/* Fixed Header + Search + Filters */}
//       <View style={styles.headerContainer}>
//         <Text style={styles.title}>
//           <Text
//             style={{
//               fontWeight: "500",
//               color: Colors.primaryGreen,
//               marginRight: 2,
//             }}
//           >
//             Dream
//           </Text>
//           Chat
//         </Text>
//         <Image
//           source={{ uri: currentUser?.profileImageUrl }}
//           style={styles.image}
//         />
//       </View>

//       <View style={styles.searchContainer}>
//         <Ionicons name="search" size={20} color={Colors.textSecondary} />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search chats..."
//           value={search}
//           onChangeText={setSearch}
//         />
//       </View>

//       <View style={styles.filterRow}>
//         {["all", "unread", "groups"].map((item) => (
//           <TouchableOpacity
//             key={item}
//             style={[
//               styles.filterButton,
//               filter === item && styles.filterButtonActive,
//             ]}
//             onPress={() => setFilter(item as any)}
//           >
//             <Text
//               style={[
//                 styles.filterText,
//                 filter === item && styles.filterTextActive,
//               ]}
//             >
//               {item.toUpperCase()}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Only the chat list reacts to the keyboard */}
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <SectionList
//           sections={[{ title: "Chats", data: filteredChats }]}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             // <ChatItem
//             //   item={item}
//             //   currentUser={currentUser} // TS now knows it's User
//             //   usersMap={users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {})}
//             //   onPress={() => console.log("Open chat", item.id)}
//             // />
//             <></>
//           )}
//           renderSectionHeader={({ section }) => (
//             <Text style={styles.sectionHeader}>{section.title}</Text>
//           )}
//         />
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default ChatsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.backgroundLight,
//     paddingHorizontal: 16,
//   },
//   headerContainer: {
//     minHeight: 60,
//     justifyContent: "space-between",
//     alignItems: "center",
//     flexDirection: "row",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "700",
//   },
//   image: {
//     width: 60,
//     height: 60,
//     borderRadius: 55,
//     borderWidth: 2.5,
//     borderColor: "rgba(255,255,255,0.8)",
//   },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f1f1f1",
//     borderRadius: 30,
//     height: 40,
//     paddingHorizontal: 10,
//     marginVertical: 14,
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 8,
//     paddingHorizontal: 6,
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   filterRow: {
//     flexDirection: "row",
//     justifyContent: "flex-start",
//     marginBottom: 10,
//     gap: 14,
//   },
//   filterButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 20,
//     backgroundColor: "#e7e7e7ff",
//     minWidth: 60,
//     alignItems: "center",
//   },
//   filterButtonActive: {
//     backgroundColor: Colors.badgeGreen,
//   },
//   filterText: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: Colors.textSecondary,
//   },
//   filterTextActive: {
//     color: Colors.primaryGreen,
//   },
//   chatItem: {
//     paddingVertical: 12,
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#ccc",
//   },
//   chatName: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   chatMessage: {
//     fontSize: 14,
//     color: Colors.textSecondary,
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginVertical: 8,
//   },
// });
