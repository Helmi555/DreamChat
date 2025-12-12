import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ImageBackground,
  Alert,
} from "react-native";
import { Colors } from "colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { db } from "configs/firebase";
import { useUser } from "context/UserContext";
import { Group, GroupMessage } from "types/Group";
import { groupsService } from "services/groupsService";
import { ref, onValue, off } from "firebase/database";
import MessageItem from "features/chats/components/MessageItem";
import TypingIndicator from "features/chats/components/TypingIndicator";
import ChangeBackgroundModal from "features/chats/elements/ChangeBackgroundModal";
import * as ImagePicker from "expo-image-picker";
import { messagesService } from "services/messageService";

// Support different expo-image-picker versions (runtime-safe)
// Prefer the new `ImagePicker.MediaType.Images` when available; otherwise
// fall back to a safe plain array/string so the picker doesn't log the
// deprecation for `MediaTypeOptions` at runtime.
const IMAGES_MEDIA_TYPE: any = (ImagePicker as any).MediaType?.Images ?? [
  "Images",
];
import { uploadDiscussionBackgroundImage } from "services/supabaseImageService";
import CircleAvatar from "features/shared/components/elements/CircleAvatar";

const GroupConversationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId: gid, groupName: gname } = route.params as {
    groupId: string;
    groupName?: string;
  };

  const groupId = gid;

  const { currentUser } = useUser();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [input, setInput] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const [group, setGroup] = useState<Group | null>(null);
  const [membersMap, setMembersMap] = useState<
    Record<string, { name: string; profileImage?: string }>
  >({});

  useEffect(() => {
    const groupRef = ref(db, `All_Groups/${groupId}`);

    const handleGroupChange = (snapshot: any) => {
      const data = snapshot.val();
      if (data) setGroup(data as Group);
      else setGroup(null);
    };

    onValue(groupRef, handleGroupChange);
    return () => off(groupRef, "value", handleGroupChange);
  }, [groupId]);

  useEffect(() => {
    const unsubscribe = groupsService.subscribeToGroupMessages(
      groupId,
      (msgs) => {
        setMessages(msgs);
      }
    );
    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    // subscribe to each member profile so typing/avatar/name are real-time
    const unsub: Array<() => void> = [];

    if (group?.memberIds?.length) {
      group.memberIds.forEach((id) => {
        const profileRef = ref(db, `profiles/${id}`);
        const handler = (snap: any) => {
          const p = snap.val();
          setMembersMap((prev) => ({
            ...prev,
            [id]: {
              name: p?.name || p?.pseudo || p?.email,
              profileImage: p?.profileImageUrl,
            },
          }));
        };
        onValue(profileRef, handler);
        unsub.push(() => off(profileRef, "value", handler));
      });
    }

    return () => unsub.forEach((u) => u());
  }, [group?.memberIds]);

  useEffect(() => {
    if (isAtBottom && scrollViewRef.current) {
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        100
      );
    }
  }, [messages, keyboardVisible]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        250
      );
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Auto-scroll when messages or typing flags change, only if user is at bottom
  useEffect(() => {
    if (isAtBottom) {
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        50
      );
    }
  }, [messages, group?.typing, isAtBottom]);

  useEffect(() => {
    return () => {
      if (currentUser?.id)
        db.ref(`All_Groups/${groupId}/typing/${currentUser.id}`).set(false);
    };
  }, [groupId, currentUser?.id]);

  const sendMessage = async () => {
    if (input.trim().length > 0 && currentUser) {
      try {
        await groupsService.sendGroupMessage(
          groupId,
          currentUser.id,
          input.trim()
        );
        setInput("");
        setInputHeight(40);
        setTimeout(
          () => scrollViewRef.current?.scrollToEnd({ animated: true }),
          100
        );
      } catch (err) {
        console.error("Error sending group message:", err);
      }
    }
  };

  const handleOnFocus = () => {
    if (currentUser?.id)
      db.ref(`All_Groups/${groupId}/typing/${currentUser.id}`).set(true);
  };
  const handleOnBlur = () => {
    if (currentUser?.id)
      db.ref(`All_Groups/${groupId}/typing/${currentUser.id}`).set(false);
  };

  const handleOpenModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

  const handleChangeBackground = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access the image library is required!"
        );
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });
      if (pickerResult.canceled) return;
      const imageUri = pickerResult.assets[0].uri;
      const newUrl = await uploadDiscussionBackgroundImage(
        groupId,
        imageUri,
        group?.imageUrl
      );
      await db.ref(`All_Groups/${groupId}`).update({ imageUrl: newUrl });
    } catch (err) {
      console.error("Error changing background image:", err);
    }
  };

  const pickAndSendGroupImage = async () => {
    try {
      if (!currentUser) return;

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access the image library is required!"
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (pickerResult.canceled) return;

      const uri = pickerResult.assets[0].uri;

      await messagesService.sendGroupMediaMessage(
        groupId,
        currentUser.id,
        uri,
        "image"
      );

      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        200
      );
    } catch (err) {
      console.error("Error sending group image:", err);
      Alert.alert("Error", "Failed to send image. Please try again.");
    }
  };

  return (
    <ImageBackground
      source={{ uri: group?.imageUrl || undefined }}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: group?.imageUrl
              ? "transparent"
              : Colors.backgroundLight,
          },
        ]}
        edges={["top", "left", "right"]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
            style={styles.headerLeft}
          >
            <Ionicons name="arrow-back" size={30} color={"#000"} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {gname || group?.name || "Group"}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity>
              <Ionicons name="videocam" size={24} color={Colors.primaryGreen} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="call" size={24} color={Colors.primaryGreen} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleOpenModal}>
              <Ionicons name="ellipsis-vertical" size={24} color={"#000"} />
            </TouchableOpacity>
          </View>
        </View>

        <ChangeBackgroundModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          onChangeBackground={handleChangeBackground}
        />

        <KeyboardAvoidingView
          style={{ flex: 1, zIndex: 1000 }}
          behavior={"padding"}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            ref={scrollViewRef}
            bounces={false}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            style={styles.messages}
            contentContainerStyle={{
              paddingVertical: 12,
              paddingBottom: 10 + insets.bottom,
            }}
            onContentSizeChange={() => {
              if (!keyboardVisible && scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: false });
              }
            }}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => (
              <MessageItem
                isGroup={true}
                groupId={groupId}
                discussionId={message.idMessage}
                key={message.idMessage}
                message={message}
                secondUserName={
                  membersMap[message.senderId]?.name || message.senderId
                }
                isSender={message.senderId === currentUser?.id}
                receiverProfileImage={
                  membersMap[message.senderId]?.profileImage
                }
                seen={false}
              />
            ))}

            {(() => {
              if (!group?.typing) return null;
              const typingIds = Object.keys(group.typing || {}).filter(
                (id) => id !== currentUser?.id && (group.typing || {})[id]
              );
              if (typingIds.length === 0) return null;
              return (
                <View
                  style={{
                    marginTop: 6,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      marginRight: 2,
                      marginTop: 6,
                    }}
                  >
                    {typingIds.map((id, index) => {
                      const member = membersMap[id];
                      const profileImage = member?.profileImage;
                      const letter = (member?.name || id || "?")
                        .charAt(0)
                        .toUpperCase();
                      return (
                        <View
                          key={id}
                          style={{ marginLeft: index === 0 ? 0 : -6 }}
                        >
                          <CircleAvatar
                            imageUrl={profileImage}
                            letter={letter}
                            size={30}
                          />
                        </View>
                      );
                    })}
                  </View>
                  <TypingIndicator showAvatar={false} letter={"?"} />
                </View>
              );
            })()}

            <View style={{ height: 20 }} />
          </ScrollView>

          <View
            style={[
              styles.inputRow,
              { paddingBottom: Math.max(insets.bottom, 10) },
            ]}
          >
            <TouchableOpacity
              style={styles.imageBtn}
              onPress={pickAndSendGroupImage}
            >
              <Ionicons name="image" size={22} color={Colors.primaryGreen} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { height: Math.min(inputHeight, 80) }]}
              placeholder="Type a message"
              placeholderTextColor="#9aa0a6"
              value={input}
              onChangeText={setInput}
              multiline
              onContentSizeChange={(e) =>
                setInputHeight(e.nativeEvent.contentSize.height)
              }
              onFocus={handleOnFocus}
              onBlur={handleOnBlur}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default GroupConversationScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerLeft: { width: 40, alignItems: "flex-start" },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    borderWidth: 0,
    maxWidth: "60%",
    marginHorizontal: 2,
  },
  headerRight: {
    width: 120,
    flexDirection: "row",
    justifyContent: "space-around",
    borderWidth: 0,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#202124" },
  messages: { flex: 1, paddingHorizontal: 12 },
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
  sendText: { color: "#ffffff", fontWeight: "600" },
  imageBtn: {
    marginRight: 8,
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
