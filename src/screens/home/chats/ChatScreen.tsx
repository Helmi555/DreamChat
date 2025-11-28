import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SectionList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Colors } from "colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "context/UserContext";
import ChatItem from "features/home/components/ChatItem";
import { Chat, Group, User } from "types/User";
import { useNavigation } from "@react-navigation/core";

// current id Hq0LBd6p9LRWDit7d1hV4YwJcgH2

const users: User[] = [
  {
    id: "Hq0LBd6p9LRWDit7d1hV4YwJcgH2",
    name: "Alice",
    email: "alice@example.com",
    pseudo: "alice123",
    profileImageUrl: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "user2",
    name: "Bob",
    email: "bob@example.com",
    pseudo: "bobby",
    profileImageUrl: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "user3",
    name: "Charlie",
    email: "charlie@example.com",
    pseudo: "charlieC",
    profileImageUrl: "https://i.pravatar.cc/150?img=3",
  },
];
const groups: Group[] = [
  {
    id: "g1",
    name: "Study Group",
    memberIds: ["Hq0LBd6p9LRWDit7d1hV4YwJcgH2", "user2", "user3"],
    createdBy: "Hq0LBd6p9LRWDit7d1hV4YwJcgH2",
    createdAt: 1633000000000,
    adminIds: ["Hq0LBd6p9LRWDit7d1hV4YwJcgH2"],
    lastMessageText: "Let's meet tomorrow!",
    lastMessageTimestamp: 1633194000000,
    lastRead: {
      user1: 1633194000000,
      user2: 1633193800000,
      user3: 1633193000000,
    },
  },
  {
    id: "g2",
    name: "Work Team",
    memberIds: ["user2", "user3"],
    createdBy: "user2",
    createdAt: 1633300000000,
    adminIds: ["user2"],
    lastMessageText: "Project deadline is next week.",
    lastMessageTimestamp: 1633366800000,
    lastRead: {
      user2: 1633366800000,
      user3: 1633366700000,
    },
  },
];

const now = Date.now();

export const dummyChats: (Chat | Group)[] = [
  {
    id: "1",
    participantIds: ["Hq0LBd6p9LRWDit7d1hV4YwJcgH2", "user2"],
    lastMessageText: "Hey!",
    lastMessageTimestamp: now - 1000 * 60 * 10, // 10 min ago
    lastRead: {
      Hq0LBd6p9LRWDit7d1hV4YwJcgH2: now - 1000 * 60 * 5, // read 5 min ago → read
      user2: now - 1000 * 60 * 12,
    },
  },
  {
    id: "2",
    participantIds: ["user3", "user4"],
    lastMessageText: "Meeting tomorrow",
    lastMessageTimestamp: now - 1000 * 60 * 60 * 25, // ~1.05 days ago
    lastRead: {
      Hq0LBd6p9LRWDit7d1hV4YwJcgH2: now - 1000 * 60 * 60 * 26, // read before message → unread
      user3: now - 1000 * 60 * 60 * 25,
      user4: now - 1000 * 60 * 60 * 26,
    },
  },
  {
    id: "4",
    participantIds: ["user2", "user4"],
    lastMessageText: "Got it my friend",
    lastMessageTimestamp: now - 1000 * 60 * 60 * 3, // 3 hours ago
    lastRead: {
      Hq0LBd6p9LRWDit7d1hV4YwJcgH2: now - 1000 * 60 * 60 * 2, // read 2h ago → read
      user2: now - 1000 * 60 * 60 * 3,
      user4: now - 1000 * 60 * 60 * 3.5,
    },
  },
  {
    id: "g1",
    name: "Study Group",
    memberIds: ["user5", "user6", "user7"],
    createdBy: "user5",
    createdAt: now - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    adminIds: ["user5"],
    lastMessageText: "Project update",
    lastMessageTimestamp: now - 1000 * 60 * 60 * 26, // ~1.08 days ago
    lastRead: {
      Hq0LBd6p9LRWDit7d1hV4YwJcgH2: now - 1000 * 60 * 60 * 28, // before message → unread
      user5: now - 1000 * 60 * 60 * 26,
      user6: now - 1000 * 60 * 60 * 27,
      user7: now - 1000 * 60 * 60 * 28,
    },
  },
  {
    id: "g2",
    name: "Welcome Team",
    memberIds: ["user10", "user11", "user12"],
    createdBy: "user10",
    createdAt: now - 1000 * 60 * 60 * 24 * 1, // 1 day ago
    adminIds: ["user10", "user11"],
    lastMessageText: "Welcome to the group!",
    lastMessageTimestamp: now - 1000 * 60 * 60 * 2, // 2 hours ago
    lastRead: {
      Hq0LBd6p9LRWDit7d1hV4YwJcgH2: now - 1000 * 60 * 60 * 1, // read 1h ago → read
      user10: now - 1000 * 60 * 60 * 2,
      user11: now - 1000 * 60 * 60 * 2,
      user12: now - 1000 * 60 * 60 * 2,
    },
  },
];

const ChatsScreen: React.FC = () => {
  const { currentUser } = useUser();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "groups">("all");
  const navigation = useNavigation<any>();
  const filteredChats = dummyChats
    .filter((chatOrGroup) => {
      if (!currentUser) return false;

      const lastReadForUser = chatOrGroup.lastRead?.[currentUser.id] ?? 0;
      const isUnread =
        (chatOrGroup.lastMessageTimestamp ?? 0) > lastReadForUser;

      if (filter === "unread") return isUnread;

      if (filter === "groups") {
        if ("memberIds" in chatOrGroup) return chatOrGroup.memberIds.length > 2;
        return false;
      }

      return true;
    })
    .filter((chatOrGroup) => {
      const lastText = chatOrGroup.lastMessageText?.toLowerCase() ?? "";
      return lastText.includes(search.toLowerCase());
    });

  const usersMap = users.reduce((acc, u) => {
    acc[u.id] = { ...u, avatarUrl: `https://i.pravatar.cc/150?u=${u.id}` };
    return acc;
  }, {} as Record<string, User & { avatarUrl: string }>);




  const handlePressChat = (chatId: string) => {
    console.log("Open chat", chatId);
    navigation.navigate("MessagesScreen", { chatId });
  };



  if (!currentUser) return null;




  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Fixed Header + Search + Filters */}
      <View style={styles.headerContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={[
              styles.title,
              {
                fontWeight: "500",
                color: Colors.primaryGreen,
                marginRight: 2,
              },
            ]}
          >
            Dream
          </Text>
          <Text style={styles.title}>Chat</Text>
        </View>

        <Image
          source={{ uri: currentUser?.profileImageUrl }}
          style={styles.image}
        />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        {["all", "unread", "groups"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterButton,
              filter === item && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(item as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === item && styles.filterTextActive,
              ]}
            >
              {item.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Only the chat list reacts to the keyboard */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SectionList
          sections={[{ title: "Chats", data: filteredChats }]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatItem
              key={item.id}
              item={item}
              currentUser={currentUser}
              usersMap={users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {})}
              avatarUrl={
                "memberIds" in item
                  ? `https://i.pravatar.cc/150?u=${item.id}` // stable random for group
                  : usersMap[
                      item.participantIds.find((id) => id !== currentUser.id)!
                    ]?.profileImageUrl
              }
              onPress={() => handlePressChat(item.id)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 16,
  },
  headerContainer: {
    minHeight: 60,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 55,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.8)",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 30,
    height: 40,
    paddingHorizontal: 10,
    marginVertical: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 16,
    fontWeight: "500",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
    gap: 14,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#e7e7e7ff",
    minWidth: 60,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: Colors.badgeGreen,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.primaryGreen,
  },
  chatItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
  },
  chatMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 8,
  },
});
