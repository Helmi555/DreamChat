export interface User {
  id: string;
  name?: string;
  lastName?: string;
  email: string;
  pseudo?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}


export interface Reaction {
  userId: string;  type: ReactionType; 
}

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
  userId: string;
  type: ReactionType;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  repliedTo?: string;
  edited?: boolean;
  status?: "delivered" | "read";
  reactions?: { [userId: string]: ReactionType };
}

export interface Chat {
  id: string;
  participantIds: [string, string];
  lastMessageText?: string;
  lastMessageTimestamp?: number;
  lastRead?: { [userId: string]: number };
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
  lastRead?: { [userId: string]: number };
}

export interface Chat {
  id: string;                // Chat ID
  participantIds: [string, string]; // Exactly 2 users
  lastMessageText?: string;  // Store only lightweight preview
  lastMessageTimestamp?: number;
  lastRead?: { [userId: string]: number }
}
export interface ChatRoom {
  id: string;                // user ID + currentId (sorted)
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
