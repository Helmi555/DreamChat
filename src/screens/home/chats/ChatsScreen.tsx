import React, { useEffect, useRef, useState } from "react";
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
import CircleAvatar from "features/shared/components/elements/CircleAvatar";

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

          if (discussion.participantIds.includes(currentUser?.id)) {
            fetchedDiscussions.push(discussion);
          }
        });

        console.info("[Chats] fetched discussions are ", fetchedDiscussions);

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
  }, [currentUser?.id]);

  const userRefs = useRef<Record<string, any>>({});
  const usersMapRef = useRef<Record<string, User>>({});

  useEffect(() => {
    discussions.forEach((discussion) => {
      discussion.participantIds.forEach((id) => {
        if (id !== currentUser?.id && !userRefs.current[id]) {
          const userRef = ref(db, `profiles/${id}`);
          userRefs.current[id] = userRef;

          const listener = onValue(userRef, (snapshot) => {
            const user = snapshot.val() as User;
            if (user) {
              usersMapRef.current[user.id] = user;
              setUsersMap({ ...usersMapRef.current });
            }
          });

          userRefs.current[id].off = () => off(userRef, "value", listener);
        }
      });
    });

    return () => {
      Object.values(userRefs.current).forEach((ref) => ref.off && ref.off());
    };
  }, [discussions, currentUser?.id]);

  const filteredChats = discussions.filter((chat) => {
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
            Let's connect
          </Text>
        </View>
        {currentUser?.profileImageUrl ? (
          <Image
            source={{ uri: currentUser?.profileImageUrl }}
            style={styles.image}
          />
        ) : (
          <CircleAvatar
            letter={
              currentUser?.name?.charAt(0) || currentUser?.email?.charAt(0)
            }
          />
        )}
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

      <Text style={styles.sectionHeader}>Chats</Text>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {filteredChats.length > 0 ? (
          <SectionList
            sections={[{ data: filteredChats }]}
            ListEmptyComponent={() => (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: Colors.textSecondary,
                  }}
                >
                  Loading chats ...
                </Text>
              </View>
            )}
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
                  isUnread={item.readBy[currentUser?.id || ""] === false}
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
          />
        ) : (
          <Text style={styles.emptySection}>No Chats Available</Text>
        )}
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
  emptySection: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
});
