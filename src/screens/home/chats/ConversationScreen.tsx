// ConversationScreen.tsx
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
import { Ionicons } from "@expo/vector-icons";
import { db } from "configs/firebase";
import { useUser } from "context/UserContext";
import { User } from "types/User";
import { messagesService } from "services/messageService";
import { Discussion, Message, MessageStatus } from "types/Chat";
import { ref, onValue, off } from "firebase/database";
import MessageItem from "features/chats/components/MessageItem";
import TypingIndicator from "features/chats/components/TypingIndicator";
import ChangeBackgroundModal from "features/chats/elements/ChangeBackgroundModal";
import * as ImagePicker from "expo-image-picker";
import { uploadDiscussionBackgroundImage } from "services/supabaseImageService";

// Support different expo-image-picker versions: prefer `ImagePicker.MediaType.Images`
// when available; otherwise fall back to a plain array of strings to avoid the
// `MediaTypeOptions` deprecation warning at runtime.
const IMAGES_MEDIA_TYPE: any = (ImagePicker as any).MediaType?.Images ?? [
  "Images",
];

const ConversationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { discussionId, secondUser: secondUserString } = route.params as {
    discussionId: string;
    secondUser: string;
  };

  const { currentUser } = useUser();
  const secondUser: User = JSON.parse(secondUserString);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const [discussion, setDiscussion] = useState<Discussion | null>(null);

  useEffect(() => {
    const discussionRef = ref(db, `All_Discussions/${discussionId}`);

    const handleDiscussionChange = (snapshot: any) => {
      const discussionData = snapshot.val();
      if (discussionData) {
        console.log("Fetched discussion true");
        setDiscussion(discussionData);
      } else {
        console.log("No discussion found for ID:", discussionId);
        setDiscussion(null);
      }
    };

    onValue(discussionRef, handleDiscussionChange);

    return () => {
      off(discussionRef, "value", handleDiscussionChange);
    };
  }, [discussionId]);

  useEffect(() => {
    const messagesRef = ref(db, `All_Discussions/${discussionId}/messages`);

    const handleValueChange = (snapshot: any) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesArray = Object.values(messagesData) as Message[];
        messagesArray.sort(
          (a: Message, b: Message) => a.timestamp - b.timestamp
        );
        console.log("Fetched messages:", messagesArray.length);
        setMessages(messagesArray);
      } else {
        console.log("No messages found for discussion:", discussionId);
        setMessages([]);
      }
    };

    onValue(messagesRef, handleValueChange);

    return () => {
      off(messagesRef, "value", handleValueChange);
    };
  }, [discussionId]);

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages, keyboardVisible]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
      // Scroll to bottom when keyboard appears
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 250);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    return () => {
      messagesService.setTypingStatus(
        discussionId,
        currentUser?.id || "",
        false
      );
    };
  }, [discussionId, currentUser?.id]);

  const sendMessage = async () => {
    if (input.trim().length > 0 && currentUser) {
      try {
        await messagesService.sendMessage(
          discussionId,
          currentUser.id,
          secondUser.id,
          input.trim()
        );
        setInput("");
        setInputHeight(40);

        // Scroll to bottom after sending
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const pickAndSendImage = async () => {
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

      await messagesService.sendMediaMessage(
        discussionId,
        currentUser.id,
        secondUser.id,
        uri,
        "image"
      );

      setTimeout(() => {
        if (scrollViewRef.current)
          scrollViewRef.current.scrollToEnd({ animated: true });
      }, 200);
    } catch (error) {
      console.error("Error sending image:", error);
      Alert.alert("Error", "Failed to send image. Please try again.");
    }
  };

  useEffect(() => {
    if (currentUser && discussionId) {
      messagesService.markDiscussionAsRead(discussionId, currentUser.id);
    }
  }, [currentUser, discussionId, messages]);

  const handleOnFocus = () => {
    messagesService.setTypingStatus(discussionId, currentUser?.id || "", true);
  };

  const handleOnBlur = () => {
    messagesService.setTypingStatus(discussionId, currentUser?.id || "", false);
  };

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

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

      if (pickerResult.canceled) {
        console.log("Image picker canceled");
        return;
      }

      const imageUri = pickerResult.assets[0].uri;

      const newBackgroundUrl = await uploadDiscussionBackgroundImage(
        discussionId,
        imageUri,
        discussion?.backgroundImageUrl
      );

      await messagesService.updateDiscussionBackground(
        discussionId,
        newBackgroundUrl
      );

      console.log("Background image updated successfully");
    } catch (error) {
      console.error("Error changing background image:", error);
    }
  };

  if (!secondUser) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, color: "#6b7280" }}>
          Loading user details...
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: discussion?.backgroundImageUrl || undefined }}
      style={{ flex: 1 }}
      resizeMode="cover"
      onError={(e) =>
        console.error("Image failed to load:", e.nativeEvent.error)
      }
      onLoad={() => console.log("Image loaded successfully")}
    >
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: discussion?.backgroundImageUrl
              ? "transparent"
              : Colors.backgroundLight,
          },
        ]}
        edges={["top", "left", "right"]}
      >
        {/*header*/}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={navigation.goBack}
            activeOpacity={0.6}
            style={styles.headerLeft}
          >
            <Ionicons name="arrow-back" size={30} color={"#000"} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {secondUser.name
                ? secondUser.lastName
                  ? secondUser.name + " " + secondUser.lastName
                  : secondUser.name
                : secondUser.email}
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
          behavior="padding"
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
              paddingBottom: 10, // Add some bottom padding
            }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (!keyboardVisible && scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: false });
              }
            }}
          >
            {messages.map((message, index) => (
              <MessageItem
                key={message.idMessage}
                message={message}
                secondUserName={
                  secondUser.name ? secondUser.name : secondUser.email
                }
                isSender={message.senderId === currentUser?.id}
                receiverProfileImage={secondUser.profileImageUrl}
                seen={
                  discussion?.readBy[secondUser.id] === true &&
                  index === messages.length - 1
                }
                discussionId={discussionId} // ADD THIS LINE
              />
            ))}

            {discussion?.typing && discussion.typing[secondUser.id] && (
              <View style={{ marginTop: 6 }}>
                <TypingIndicator
                  profileImage={secondUser.profileImageUrl}
                  letter={
                    secondUser.name
                      ? secondUser.name.charAt(0)
                      : secondUser.email.charAt(0)
                  }
                />
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.imageBtn}
              onPress={pickAndSendImage}
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
              onContentSizeChange={(event) =>
                setInputHeight(event.nativeEvent.contentSize.height)
              }
              onFocus={() => handleOnFocus()}
              onBlur={() => handleOnBlur()}
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

export default ConversationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerLeft: {
    width: 40,
    alignItems: "flex-start",
  },
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#202124",
  },
  messages: {
    flex: 1,
    paddingHorizontal: 12,
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
  imageBtn: {
    marginRight: 8,
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
