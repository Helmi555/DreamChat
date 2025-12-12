import { db } from "configs/firebase";
import {
  Message,
  Discussion,
  MessageType,
  ReactionType,
  MessageStatus,
} from "types/Chat";
import { uploadConversationMedia } from "./supabaseImageService";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from "configs/supabase";
import { GroupMessage } from "types/Group";

const DISCUSSIONS_PATH = "All_Discussions";
const MESSAGES_PATH = "messages";

// Generate discussion ID from two user IDs (smallerID_biggerID)
export const generateDiscussionId = (
  userId1: string,
  userId2: string
): string => {
  // Ensure IDs are sorted lexicographically
  const sortedIds = [userId1, userId2].sort((a, b) => a.localeCompare(b));
  const discussionId = `${sortedIds[0]}_${sortedIds[1]}`;

  console.log(
    "Generated discussion ID:",
    discussionId,
    "from IDs:",
    userId1,
    userId2
  ); // Debug log

  return discussionId;
};

// Get the other participant ID in a discussion
export const getOtherParticipantId = (
  discussionId: string,
  currentUserId: string
): string => {
  const ids = discussionId.split("_");
  return ids[0] === currentUserId ? ids[1] : ids[0];
};

export const messagesService = {
  // Send a message (auto-creates discussion if first message)

  async createDiscussion(
    senderId: string,
    receiverId: string
  ): Promise<string> {
    const generatedDiscussionId = generateDiscussionId(senderId, receiverId);
    const discussionRef = db.ref(
      `${DISCUSSIONS_PATH}/${generatedDiscussionId}`
    );
    const snapshot = await discussionRef.once("value");

    if (!snapshot.exists()) {
      const newDiscussion: Discussion = {
        id: generatedDiscussionId,
        participantIds: [senderId, receiverId],
        messages: {},
        lastMessageTimestamp: Date.now(),
        lastMessageSenderId: senderId,
        readBy: { [senderId]: true, [receiverId]: false },
        backgroundImageUrl: null,
        lastMessageText: null,
        typing: {},
      };
      await discussionRef.set(newDiscussion);
      console.log(`✅ New discussion created: ${generatedDiscussionId}`);
    }

    return generatedDiscussionId;
  },

  async sendMessage(
    discussionId: string,
    senderId: string,
    receiverId: string,
    messageBody: string,
    type: MessageType = "text",
    fileUrl?: string
  ): Promise<string> {
    try {
      const messageId = db.ref().child(MESSAGES_PATH).push().key;
      if (!messageId) throw new Error("Failed to generate message ID");

      const message: Message = {
        idMessage: messageId,
        messageBody,
        senderId,
        receiverId,
        type,
        timestamp: Date.now(),
        status: "delivered",
        ...(fileUrl && type !== 'text' && { fileUrl }) // Add fileUrl for non-text
      };

      const discussionRef = db.ref(`${DISCUSSIONS_PATH}/${discussionId}`);
      const snapshot = await discussionRef.once("value");

      if (!snapshot.exists()) {
        const newDiscussion: Discussion = {
          id: discussionId,
          participantIds: [senderId, receiverId],
          messages: { [messageId]: message },
          lastMessageText: type === 'text' ? messageBody : `Sent a ${type}`,
          lastMessageTimestamp: Date.now(),
          lastMessageSenderId: senderId,
          readBy: { [senderId]: true, [receiverId]: false },
          backgroundImageUrl: null,
          typing: {},
        };
        await discussionRef.set(newDiscussion);
      } else {
        // Save message
        await db.ref(`${DISCUSSIONS_PATH}/${discussionId}/messages/${messageId}`).set(message);
        
        // Update discussion
        await db.ref(`${DISCUSSIONS_PATH}/${discussionId}`).update({
          lastMessageText: type === 'text' ? messageBody : `Sent a ${type}`,
          lastMessageTimestamp: Date.now(),
          lastMessageSenderId: senderId,
          [`readBy/${senderId}`]: true,
          [`readBy/${receiverId}`]: false,
        });
      }

      return messageId;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      throw error;
    }
  },
  async sendGroupMediaMessage(
  groupId: string,
  senderId: string,
  fileUri: string,
  type: 'image' | 'audio' | 'file',
  caption?: string
): Promise<string> {
  try {
    const messageId = db.ref().child("groupMessages").push().key;
    if (!messageId) throw new Error("Failed to generate message ID");

    // Upload to group-media bucket
    const fileName = `${type}-${Date.now()}.${type === 'audio' ? 'm4a' : 'jpg'}`;
    const filePath = `${groupId}/${messageId}/${fileName}`;
    
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const arrayBuffer = decode(base64);
    
    const contentType = type === 'audio' ? 'audio/m4a' : 'image/jpeg';
    
    const { error } = await supabase.storage
      .from('conversation-media') // Same bucket
      .upload(filePath, arrayBuffer, { contentType });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('conversation-media')
      .getPublicUrl(filePath);

    // Create group message
    const message: GroupMessage = {
      idMessage: messageId,
      messageBody: caption || `Sent a ${type}`,
      senderId,
      receiverId: groupId,
      timestamp: Date.now(),
      type,
      status: "delivered",
      fileUrl: publicUrl,
    };

    await db.ref(`All_Groups/${groupId}/groupMessages/${messageId}`).set(message);
    await db.ref(`All_Groups/${groupId}`).update({
      lastMessageText: `Sent a ${type}`,
      lastMessageTimestamp: Date.now(),
      lastMessage: senderId,
    });

    return messageId;
  } catch (error) {
    console.error("❌ Error sending group media:", error);
    throw error;
  }
},
async sendMediaMessage(
    discussionId: string,
    senderId: string,
    receiverId: string,
    fileUri: string,
    type: 'image' | 'audio' | 'file',
    caption?: string
  ): Promise<string> {
    try {
      const messageId = db.ref().child(MESSAGES_PATH).push().key;
      if (!messageId) throw new Error("Failed to generate message ID");

      // 1. Upload to Supabase
      const fileUrl = await uploadConversationMedia(
        discussionId, 
        messageId, 
        fileUri, 
        type
      );

      // 2. Send message with URL
      return await this.sendMessage(
        discussionId,
        senderId,
        receiverId,
        caption || `Sent a ${type}`,
        type,
        fileUrl
      );
    } catch (error) {
      console.error("❌ Error sending media:", error);
      throw error;
    }
  },

  // Get messages for a discussion (real-time)
  subscribeToMessages(
    discussionId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const messagesRef = db.ref(`${DISCUSSIONS_PATH}/${discussionId}/messages`);

    const handleSnapshot = (snapshot: any) => {
      const messagesData = snapshot.val();
      const messages: Message[] = [];

      if (messagesData) {
        Object.keys(messagesData).forEach((key) => {
          messages.push(messagesData[key]);
        });
        // Sort by timestamp (oldest first)
        messages.sort((a, b) => a.timestamp - b.timestamp);
      }

      callback(messages);
    };

    messagesRef.on("value", handleSnapshot);
    return () => messagesRef.off("value", handleSnapshot);
  },

  // Get user's discussions (real-time)
  subscribeToUserDiscussions(
    userId: string,
    callback: (discussions: Discussion[]) => void
  ): () => void {
    const discussionsRef = db.ref(DISCUSSIONS_PATH);

    const handleSnapshot = (snapshot: any) => {
      const discussionsData = snapshot.val();
      const userDiscussions: Discussion[] = [];

      if (discussionsData) {
        Object.keys(discussionsData).forEach((discussionId) => {
          const discussion = discussionsData[discussionId];
          // Check if user is participant (parse from discussionId)
          const participantIds = discussionId.split("_");
          if (participantIds.includes(userId)) {
            userDiscussions.push(discussion);
          }
        });
        // Sort by last message timestamp (newest first)
        userDiscussions.sort(
          (a, b) =>
            (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)
        );
      }

      callback(userDiscussions);
    };

    discussionsRef.on("value", handleSnapshot);
    return () => discussionsRef.off("value", handleSnapshot);
  },

  // Get specific discussion
  async getDiscussion(discussionId: string): Promise<Discussion | null> {
    try {
      const snapshot = await db
        .ref(`${DISCUSSIONS_PATH}/${discussionId}`)
        .once("value");
      return snapshot.val();
    } catch (error) {
      console.error("❌ Error getting discussion:", error);
      throw error;
    }
  },

  // Add reaction to message
  async addReaction(
    discussionId: string,
    messageId: string,
    userId: string,
    reaction: ReactionType
  ): Promise<void> {
    try {
      await db
        .ref(
          `${DISCUSSIONS_PATH}/${discussionId}/messages/${messageId}/reactions/${userId}`
        )
        .set(reaction);
      console.log(`✅ ${userId} reacted with ${reaction}`);
    } catch (error) {
      console.error("❌ Error adding reaction:", error);
      throw error;
    }
  },

  async removeReaction(
    discussionId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    try {
      await db
        .ref(
          `${DISCUSSIONS_PATH}/${discussionId}/messages/${messageId}/reactions/${userId}`
        )
        .remove();
      console.log(`✅ ${userId} removed reaction`);
    } catch (error) {
      console.error("❌ Error removing reaction:", error);
      throw error;
    }
  },
  async setTyping(
    discussionId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      const typingUpdate: any = {};
      typingUpdate[`typing/${userId}`] = isTyping;

      await db.ref(`${DISCUSSIONS_PATH}/${discussionId}`).update(typingUpdate);

      // Auto remove typing after 3 seconds
      if (isTyping) {
        setTimeout(() => {
          db.ref(
            `${DISCUSSIONS_PATH}/${discussionId}/typing/${userId}`
          ).remove();
        }, 3000);
      }

      console.log(`✍️ ${userId} ${isTyping ? "is typing" : "stopped typing"}`);
    } catch (error) {
      console.error("❌ Error setting typing:", error);
      throw error;
    }
  },

  // Unified method to set typing status
  async setTypingStatus(
    discussionId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      console.info(
        "[Setting Typing] conversationId: ",
        discussionId,
        "userId: ",
        userId
      );
      if (!discussionId || !userId) {
        throw new Error("Discussion ID and User ID are required");
      }
      const typingUpdate: any = {};
      typingUpdate[`typing/${userId}`] = isTyping;

      await db.ref(`${DISCUSSIONS_PATH}/${discussionId}`).update(typingUpdate);

      console.log(`✍️ ${userId} ${isTyping ? "is typing" : "stopped typing"}`);
    } catch (error) {
      console.error("❌ Error setting typing status:", error);
      throw error;
    }
  },

  // Subscribe to typing status
  subscribeToTyping(
    discussionId: string,
    callback: (typing: { [userId: string]: boolean }) => void
  ): () => void {
    const typingRef = db.ref(`${DISCUSSIONS_PATH}/${discussionId}/typing`);

    const handleSnapshot = (snapshot: any) => {
      callback(snapshot.val() || {});
    };

    typingRef.on("value", handleSnapshot);
    return () => typingRef.off("value", handleSnapshot);
  },

  // Mark message as read
  async markAsRead(discussionId: string, messageId: string): Promise<void> {
    try {
      await db
        .ref(`${DISCUSSIONS_PATH}/${discussionId}/messages/${messageId}/status`)
        .set("read");
      console.log(`✅ Message marked as read: ${messageId}`);
    } catch (error) {
      console.error("❌ Error marking as read:", error);
      throw error;
    }
  },

  // Delete message
  async deleteMessage(discussionId: string, messageId: string): Promise<void> {
    try {
      await db
        .ref(`${DISCUSSIONS_PATH}/${discussionId}/messages/${messageId}`)
        .remove();
      console.log(`✅ Message deleted: ${messageId}`);
    } catch (error) {
      console.error("❌ Error deleting message:", error);
      throw error;
    }
  },

  // Edit message
  async editMessage(
    discussionId: string,
    messageId: string,
    newMessageBody: string
  ): Promise<void> {
    try {
      await db
        .ref(`${DISCUSSIONS_PATH}/${discussionId}/messages/${messageId}`)
        .update({
          messageBody: newMessageBody,
          edited: true,
        });
      console.log(`✅ Message edited: ${messageId}`);
    } catch (error) {
      console.error("❌ Error editing message:", error);
      throw error;
    }
  },

  // Update discussion background
  async updateDiscussionBackground(
    discussionId: string,
    backgroundImageUrl: string
  ): Promise<void> {
    try {
      await db
        .ref(`${DISCUSSIONS_PATH}/${discussionId}/backgroundImageUrl`)
        .set(backgroundImageUrl);
      console.log(`✅ Discussion background updated: ${discussionId}`);
    } catch (error) {
      console.error("❌ Error updating discussion background:", error);
      throw error;
    }
  },
  async markDiscussionAsRead(
    discussionId: string,
    userId: string
  ): Promise<void> {
    try {
      await db
        .ref(`${DISCUSSIONS_PATH}/${discussionId}/readBy/${userId}`)
        .set(true);
      console.log(`✅ Discussion marked as read by ${userId}`);
    } catch (error) {
      console.error("❌ Error marking discussion as read:", error);
      throw error;
    }
  },
};
