import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  SectionList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ChatItem from "features/chats/components/ChatItem";
import { Discussion } from "types/Chat";
import { User } from "types/User";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "types/Navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "colors";
import { useUser } from "context/UserContext";
import userService from "services/userService";
import { ref, onValue, off } from "firebase/database";
import { db } from "configs/firebase";

const ChatsScreen: React.FC = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]); 
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "groups">("all");
  const { currentUser } = useUser();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, "ChatsScreen">
    >();

  useEffect(() => {
    const discussionsRef = ref(db, "All_Discussions");

    const handleDiscussionsSnapshot = (snapshot: any) => {
      const discussionsData = snapshot.val();
      const fetchedDiscussions: Discussion[] = [];

      if (discussionsData) {
        Object.keys(discussionsData).forEach((discussionId) => {
          const discussion = discussionsData[discussionId];
          fetchedDiscussions.push(discussion);
        });

        // Sort discussions by last message timestamp (newest first)
        fetchedDiscussions.sort(
          (a, b) =>
            (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)
        );
      }

      setDiscussions(fetchedDiscussions);
    };

    onValue(discussionsRef, handleDiscussionsSnapshot);

    return () => {
      off(discussionsRef, "value", handleDiscussionsSnapshot);
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const userPromises = discussions.flatMap((discussion) =>
        discussion.participantIds.map((id) =>
          id !== currentUser?.id ? userService.getUserProfile(id) : null
        )
      );

      const users = await Promise.all(userPromises);
      const usersMap: Record<string, User> = {};
      users.forEach((user) => {
        if (user) {
          usersMap[user.id] = user;
        }
      });
      setUsersMap(usersMap);
    };

    fetchUsers();
  }, [discussions, currentUser]);

  const filteredChats = discussions.filter((chat) => {
    // Apply search and filter logic
    if (search.trim() === "") {
      return true; // Include all chats if search is empty
    }
    const lastText = chat.lastMessageText?.toLowerCase() ?? "";
    return lastText.includes(search.toLowerCase());
  });

  useEffect(() => {
    //console.log("Filtered Chats:", filteredChats); // Log filtered chats whenever they change
  }, [filteredChats]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerContainer}>
        <View>
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
          <Text
            style={{
              color: Colors.textSecondary,
              fontSize: 14,
              marginLeft: 2,
              fontWeight: "500",
            }}
          >
            Lets connect
          </Text>
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SectionList
          sections={[{ title: "Chats", data: filteredChats }]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const otherUserId = item.participantIds.find(
              (id) => id !== currentUser?.id
            );
            const otherUser = otherUserId ? usersMap[otherUserId] : null;

            return (
              <ChatItem
                discussion={item}
                otherUser={otherUser}
                onPress={() => {
                  const userString = JSON.stringify(otherUser);
                  navigation.navigate("ConversationScreen", {
                    discussionId: item.id,
                    secondUser: userString,
                  });
                }}
              />
            );
          }}
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
    marginVertical: 20,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
});
