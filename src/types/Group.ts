import { MessageStatus, MessageType, ReactionType } from "./Chat";
export interface GroupMessage {
  idMessage: string;
  messageBody: string;
  senderId: string;
  receiverId: string;
  timestamp: number;
  type: MessageType;
  status?: MessageStatus;
  reactions?: {
    [userId: string]: ReactionType;
  };
  imageUrl?: string;
}
export interface Group {
  id: string;
  name: string;
  memberIds: string[];
  groupMessages: {
    [idGroupMessage: string]: GroupMessage;
  };
  createdBy: string;
  createdAt: number;
  lastMessageText?: string;
  lastMessageTimestamp?: number;
  typing?: {
    [userId: string]: boolean;
  };
  imageUrl?: string;
  lastMessage?: string;
}
export interface Invitation {
  id: string;
  groupId: string;
  senderId: string;
  recipientId: string;
  status: "pending" | "accepted" | "declined";
  timestamp: number;
}
