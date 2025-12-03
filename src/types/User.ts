export interface User {
  id: string;
  name?: string;
  lastName?: string;
  email: string;
  pseudo?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

export type ReactionType =
  | "like"
  | "love"
  | "laugh"
  | "sad"
  | "angry"
  | "surprised";

export interface Reaction {
  userId: string; // Who reacted
  type: ReactionType; // "like", "love", "laugh", "sad", etc.
}

export interface Message {
  id: string; // Unique message id
  senderId: string; // Who sent it
  text: string; // Message text
  timestamp: number; // When it was sent
  repliedTo?: string; // Optional: id of message being replied to
  edited?: boolean; // Optional: if message was edited
  status?: "delivered" | "read";
  reactions?: { [userId: string]: ReactionType };
}

export interface Chat {
  id: string;                // Chat ID
  participantIds: [string, string]; // Exactly 2 users
  lastMessageText?: string;  // Store only lightweight preview
  lastMessageTimestamp?: number;
  lastRead?: { [userId: string]: number }
}

export interface Group {
  id: string;
  name: string;
  memberIds: string[];
  createdBy: string;
  createdAt: number;
  adminIds?: string[];
  lastMessageText?: string;
  lastMessageTimestamp?: number;
  lastRead?: { [userId: string]: number }
}
