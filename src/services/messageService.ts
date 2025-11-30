import { db } from "configs/firebase";
import {
  Message,
  Discussion,
  MessageType,
  ReactionType,
  MessageStatus,
} from "types/Chat";

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
      };

      // Check if discussion exists, create if not
      const discussionRef = db.ref(`${DISCUSSIONS_PATH}/${discussionId}`);
      const snapshot = await discussionRef.once("value");

      if (!snapshot.exists()) {
        // Create new discussion
        const newDiscussion: Discussion = {
          id: discussionId,
          participantIds: [senderId, receiverId],
          messages: { [messageId]: message },
          lastMessageText: messageBody,
          lastMessageTimestamp: Date.now(),
        };
        await discussionRef.set(newDiscussion);
        console.log(`✅ New discussion created: ${discussionId}`);
      }

      // Save message to discussion
      await db
        .ref(`${DISCUSSIONS_PATH}/${discussionId}/messages/${messageId}`)
        .set(message);

      // Update discussion last message
      await db.ref(`${DISCUSSIONS_PATH}/${discussionId}`).update({
        lastMessageText: messageBody,
        lastMessageTimestamp: Date.now(),
      });

      console.log(`✅ Message sent to discussion: ${discussionId}`);
      return messageId;
    } catch (error) {
      console.error("❌ Error sending message:", error);
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

  // Remove reaction
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

  // Set typing status
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
};
