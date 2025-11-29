export type ReactionType = "like" | "love" | "laugh" | "sad" | "angry" | "surprised";

export interface Reaction {
  userId: string;
  type: ReactionType;
}

export type MessageType = "text" | "image" | "file";

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  fileUrl?: string;
  type: MessageType;
  timestamp: number;
  repliedTo?: string;
  edited?: boolean;
  status?: "delivered" | "read";
  reactions?: { [userId: string]: ReactionType };
}

export interface Chat {
  id: string; // combination of two user IDs sorted: userA+userB
  participantIds: [string, string];
  lastMessageText?: string;
  lastMessageTimestamp?: number;
  typing?: { [userId: string]: boolean };
}
