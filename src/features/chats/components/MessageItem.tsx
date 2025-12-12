import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Keyboard,
} from "react-native";
import { Colors } from "colors";
import { Message, ReactionType, REACTIONS } from "types/Chat";
import CircleAvatar from "features/shared/components/elements/CircleAvatar";
import { Ionicons } from "@expo/vector-icons";
import { messagesService } from "services/messageService";
import { useUser } from "context/UserContext";
import { groupsService } from "services/groupsService";

interface MessageItemProps {
  message: Message;
  isSender: boolean;
  receiverProfileImage?: string;
  secondUserName: string;
  seen?: boolean;
  discussionId: string;
  isGroup?: boolean;
  groupId?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isSender,
  secondUserName,
  receiverProfileImage,
  seen,
  discussionId,
  isGroup = false,
  groupId,
}) => {
  const { currentUser } = useUser();
  const [showReactions, setShowReactions] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const slideAnim = useState(new Animated.Value(0))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];

  // Dynamic reactions bar sizing & positioning to keep it on-screen
  const [reactionsWidth, setReactionsWidth] = useState<number>(220);
  const screenWidth = Dimensions.get("window").width;
  const containerLeft = Math.max(
    8,
    Math.min(position.x - reactionsWidth / 2, screenWidth - reactionsWidth - 8)
  );
  const rawArrowLeft = position.x - containerLeft - 8; // 8 = half arrow width
  const arrowLeft = Math.max(12, Math.min(rawArrowLeft, reactionsWidth - 24));
  const containerTop = Math.max(8, position.y - 70);

  // Image aspect ratio state for dynamic image height
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    if (message.type === "image" && message.fileUrl) {
      // get remote image size to compute aspectRatio
      Image.getSize(
        message.fileUrl,
        (w, h) => {
          if (!mounted) return;
          if (w > 0 && h > 0) setImageAspectRatio(w / h);
        },
        (err) => {
          if (!mounted) return;
          console.warn("Could not get image size:", err);
          setImageAspectRatio(null);
        }
      );
    } else {
      setImageAspectRatio(null);
    }

    return () => {
      mounted = false;
    };
  }, [message.fileUrl, message.type]);

  // Group reactions by type to count them
  const reactionCounts = React.useMemo(() => {
    const counts: { [type in ReactionType]?: number } = {};
    if (message.reactions) {
      Object.values(message.reactions).forEach((type) => {
        counts[type] = (counts[type] || 0) + 1;
      });
    }
    return counts;
  }, [message.reactions]);

  // Get user's current reaction
  const userReaction = currentUser?.id
    ? message.reactions?.[currentUser.id]
    : undefined;

  const handleLongPress = (event: any) => {
    Keyboard.dismiss();
    const { pageX, pageY } = event.nativeEvent;
    setPosition({ x: pageX, y: pageY });
    setShowReactions(true);

    // Animate in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
   // setShowReactions(false);
  };

  const handleReaction = async (reactionType: ReactionType) => {
    if (!currentUser?.id || !message.idMessage) return;

    try {
      if (userReaction === reactionType) {
        // Remove reaction if same
        if (isGroup) {
          await groupsService.removeReaction(
            groupId!,
            message.idMessage,
            currentUser.id
          );
          setShowReactions(false);
          return;
        } else {
          await messagesService.removeReaction(
            discussionId,
            message.idMessage,
            currentUser.id
          );
        }
      } else {
        if (isGroup) {
          await groupsService.addReaction(
            groupId!,
            message.idMessage,
            currentUser.id,
            reactionType
          );
          setShowReactions(false);
          return;
        } else {
          await messagesService.addReaction(
            discussionId,
            message.idMessage,
            currentUser.id,
            reactionType
          );
        }
      }
      setShowReactions(false);
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  const renderReactionBubble = () => {
    const reactionTypes = Object.keys(reactionCounts) as ReactionType[];
    if (reactionTypes.length === 0) return null;

    const bubblePosition = isSender
      ? styles.reactionBubbleSender
      : styles.reactionBubbleReceiver;
    const bubbleStyle = isSender
      ? styles.reactionBubbleRight
      : styles.reactionBubbleLeft;

    return (
      <View style={[styles.reactionBubble, bubblePosition, bubbleStyle]}>
        {reactionTypes.map((type, index) => {
          const reaction = REACTIONS.find((r) => r.type === type);
          if (!reaction) return null;

          return (
            <View key={type} style={styles.reactionItem}>
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              {reactionCounts[type]! > 1 && (
                <Text style={styles.reactionCount}>{reactionCounts[type]}</Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        delayLongPress={300}
        onLongPress={handleLongPress}
        onPress={() => Keyboard.dismiss()}
      >
        <View
          style={[
            styles.messageContainer,
            isSender ? styles.senderContainer : styles.receiverContainer,
          ]}
        >
          {!isSender && (
            <View style={styles.avatarContainer}>
              {receiverProfileImage ? (
                <Image
                  source={{ uri: receiverProfileImage }}
                  style={styles.avatar}
                />
              ) : (
                <CircleAvatar letter={secondUserName.charAt(0)} size={30} />
              )}
            </View>
          )}

          <View style={styles.bubbleWrapper}>
            {renderReactionBubble()}

            <View
              style={[
                styles.bubble,
                // apply normal colored bubble only for text/other messages
                message.type !== "image"
                  ? isSender
                    ? styles.senderBubble
                    : styles.receiverBubble
                  : undefined,
                // when image, use image-specific alignment and transparent background
                message.type === "image"
                  ? isSender
                    ? styles.imageBubbleSender
                    : styles.imageBubbleReceiver
                  : undefined,
                userReaction && styles.hasReactionBubble,
              ]}
            >
              {message.type === "image" && message.fileUrl ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleLongPress}
                  style={styles.imageTouchable}
                >
                  <Image
                    source={{ uri: message.fileUrl }}
                    style={[
                      styles.imageMessage,
                      imageAspectRatio
                        ? {
                            width: Math.min(screenWidth * 0.66, 360),
                            aspectRatio: imageAspectRatio,
                          }
                        : {
                            width: Math.min(screenWidth * 0.66, 360),
                            height: 180,
                          },
                    ]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ) : (
                <Text
                  style={[
                    styles.messageText,
                    isSender ? styles.senderText : styles.receiverText,
                  ]}
                >
                  {message.messageBody}
                </Text>
              )}

              <View style={styles.rightContainer}>
                <Text
                  style={[
                    styles.timestamp,
                    { color: isSender ? "#ffffff" : "#555" },
                  ]}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>

                {message.edited && (
                  <Text
                    style={[
                      styles.editedText,
                      { color: isSender ? "#ffffffcc" : "#555" },
                    ]}
                  >
                    edited
                  </Text>
                )}

                {isSender && seen && (
                  <Ionicons
                    style={styles.seenIndicator}
                    name="checkmark-done"
                    size={16}
                    color={Colors.primaryBlue}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Reactions Modal */}
      {showReactions && (
        <Modal
          transparent
          visible={showReactions}
          onRequestClose={() => setShowReactions(false)}
        >
          <TouchableOpacity
            style={styles.reactionsOverlay}
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setShowReactions(false);
            }}
          >
            <Animated.View
              style={[
                styles.reactionsContainer,
                {
                  top: containerTop,
                  left: containerLeft,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                  opacity: opacityAnim,
                },
              ]}
            >
              <View
                style={styles.reactionsBar}
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  if (w && w !== reactionsWidth) setReactionsWidth(w);
                }}
              >
                {REACTIONS.map((reaction) => (
                  <TouchableOpacity
                    key={reaction.type}
                    style={[
                      styles.reactionButton,
                      userReaction === reaction.type &&
                        styles.reactionButtonActive,
                    ]}
                    onPress={() => handleReaction(reaction.type)}
                  >
                    <Text style={styles.reactionEmojiLarge}>
                      {reaction.emoji}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={[styles.reactionsArrow, { left: arrowLeft }]} />
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 16,
  },
  senderContainer: {
    justifyContent: "flex-end",
  },
  receiverContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  bubbleWrapper: {
    position: "relative",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopRightRadius: 14,
    borderTopLeftRadius: 14,
    minWidth: "50%",
  },
  hasReactionBubble: {
    marginBottom: 8,
  },
  senderBubble: {
    backgroundColor: Colors.primaryGreen,
    alignSelf: "flex-end",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 2,
  },
  receiverBubble: {
    backgroundColor: "#f1f1f1",
    alignSelf: "flex-start",
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  senderText: {
    color: "#fff",
  },
  receiverText: {
    color: "#000",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.8,
  },
  editedText: {
    fontSize: 10,
    fontStyle: "italic",
    opacity: 0.7,
  },
  seenIndicator: {
    marginLeft: 2,
  },
  // Reactions Bubble (shows on top of message)
  reactionBubble: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
    zIndex: 10,
  },
  reactionBubbleSender: {
    bottom: -5,
  },
  reactionBubbleReceiver: {
    bottom: -5,
  },
  reactionBubbleLeft: {
    left: 0,
  },
  reactionBubbleRight: {
    right: 0,
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
  },
  // Reactions Modal
  reactionsOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  reactionsContainer: {
    position: "absolute",
    zIndex: 1000,
  },
  reactionsBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  reactionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  reactionButtonActive: {
    backgroundColor: "#e3f2fd",
    transform: [{ scale: 1.1 }],
  },
  reactionEmojiLarge: {
    fontSize: 20,
  },
  imageMessage: {
    borderRadius: 12,
    marginBottom: 6,
    overflow: "hidden",
  },
  imageBubble: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 12,
  },
  imageBubbleSender: {
    alignSelf: "flex-end",
    backgroundColor: "transparent",
  },
  imageBubbleReceiver: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
  },
  imageTouchable: {
    borderRadius: 12,
    overflow: "hidden",
  },
  imageCaption: {
    fontSize: 14,
    marginTop: 4,
    color: "#333",
  },
  reactionsArrow: {
    position: "absolute",
    bottom: -8,
    left: "50%",
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#fff",
  },
});

export default MessageItem;
