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
  const [inputHeight, setInputHeight] = useState(40); // Default height for one line
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  //logs the diss id the two userss

  console.info();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);

  useEffect(() => {
    const discussionRef = ref(db, `All_Discussions/${discussionId}`);

    const handleDiscussionChange = (snapshot: any) => {
      const discussionData = snapshot.val();
      if (discussionData) {
        console.log("Fetched discussion:", discussionData); // Debug log
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
        // Convert messages object to array and sort by timestamp
        const messagesArray = Object.values(messagesData) as Message[];
        messagesArray.sort(
          (a: Message, b: Message) => a.timestamp - b.timestamp
        );
        console.log("Fetched messages:", messagesArray); // Debug log
        setMessages(messagesArray);
      } else {
        console.log("No messages found for discussion:", discussionId);
        setMessages([]);
      }
    };

    onValue(messagesRef, handleValueChange);

    return () => {
      // Cleanup listener on unmount
      off(messagesRef, "value", handleValueChange);
    };
  }, [discussionId]);

  useEffect(() => {
    // Auto-scroll to the bottom when messages update
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
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
        setInputHeight(40); // Reset input height after sending
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

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
      // Ask for permission to access the image library
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access the image library is required!"
        );
        return;
      }

      // Let the user pick an image
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (pickerResult.canceled) {
        console.log("Image picker canceled");
        return;
      }

      const imageUri = pickerResult.assets[0].uri;

      // Upload the selected image
      const newBackgroundUrl = await uploadDiscussionBackgroundImage(
        discussionId,
        imageUri,
        discussion?.backgroundImageUrl
      );

      // Update the discussion background URL in the database
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
          //backgroundColor: Colors.backgroundLight,
        }}
      >
        <Text style={{ fontSize: 16, color: "#6b7280" }}>
          Loading user details...
        </Text>
      </View>
    );
  }
  console.info("Backgorund image is: ", discussion?.backgroundImageUrl);
  return (
    <ImageBackground
      source={{ uri: discussion?.backgroundImageUrl || undefined }}
      //source={{ uri: "/DreamChat/assets/img_background.jpg" }}
      style={{ flex: 1 }}
      resizeMode="cover"
      onError={(e) =>
        console.error("Image failed to load:", e.nativeEvent.error)
      }
      onLoad={() => console.log("Image loaded successfully")}
    >
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/*header*/}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={navigation.goBack}
            activeOpacity={0.6}
            style={styles.headerLeft}
          >
            <Ionicons name="arrow-back" size={30} color={"#000"} />
          </TouchableOpacity>

          {/* Center Section: Title */}
          <View style={styles.headerCenter}>
            <Text style={styles.title}>
              {secondUser.name + " " + secondUser.lastName}
            </Text>
          </View>

          {/* Right Section: Call and Video Icons */}
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

        {/* Modal */}
        <ChangeBackgroundModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          onChangeBackground={handleChangeBackground}
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0} // Adjust offset for header height
        >
          <ScrollView
            ref={scrollViewRef}
            bounces={false}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            style={styles.messages}
            contentContainerStyle={{ paddingVertical: 12 }}
            onContentSizeChange={() => {
              if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: true });
              }
            }}
          >
            {messages.map((message) => (
              <MessageItem
                key={message.idMessage}
                message={message}
                secondUserName={
                  secondUser.name ? secondUser.name : secondUser.email
                }
                isSender={message.senderId === currentUser?.id}
                senderProfileImage={currentUser?.profileImageUrl}
                receiverProfileImage={secondUser.profileImageUrl}
                seen={
                  message.status === "read" || message.status === "delivered"
                }
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
          </ScrollView>

          <View
            style={[styles.inputRow, keyboardVisible && { marginBottom: 0 }]}
          >
            <TextInput
              style={[
                styles.input,
                { height: Math.min(inputHeight, 80) }, // Dynamically adjust height, max 80
              ]}
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
    //backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    //backgroundColor: "#ffffff",
  },
  headerLeft: {
    width: 50, // Fixed width for consistent spacing
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 1, // Take up remaining space
    alignItems: "center",
  },
  headerRight: {
    width: 100, // Fixed width for consistent spacing
    flexDirection: "row",
    justifyContent: "space-between",
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
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginVertical: 6,
    elevation: 0,
  },
  bubbleIncoming: {
    alignSelf: "flex-start",
    //backgroundColor: "#ffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  bubbleOutgoing: {
    alignSelf: "flex-end",
    //backgroundColor: Colors.primaryGreen,
  },
  bubbleText: {
    fontSize: 15,
    color: "#202124",
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
});
