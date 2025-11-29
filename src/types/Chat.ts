// chat.ts
export type MessageType = "text" | "image" | "file";

export type ReactionType = "like" | "love" | "laugh" | "sad" | "angry" | "surprised";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  content: string;
  timestamp: number;
  repliedTo?: string;
  edited?: boolean;
  status?: "sent" | "delivered" | "read";
  reactions?: { [userId: string]: ReactionType }; // unique reaction per user per message
}

export interface Chat {
  id: string;
  userA: string;
  userB: string;
  backgroundImageUrl?: string;
  typing?: { [userId: string]: boolean };
  lastMessageText?: string;
  lastMessageTimestamp?: number;
  lastRead?: { [userId: string]: number };
}
