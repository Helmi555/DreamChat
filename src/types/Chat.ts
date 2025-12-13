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

export const REACTIONS: { type: ReactionType; emoji: string; color: string }[] =
  [
    { type: "like", emoji: "👍", color: "#FFD700" },
    { type: "love", emoji: "❤️", color: "#FF4081" },
    { type: "laugh", emoji: "😂", color: "#FFD700" },
    { type: "sad", emoji: "😢", color: "#2196F3" },
    { type: "angry", emoji: "😠", color: "#FF5722" },
    { type: "surprised", emoji: "😮", color: "#9C27B0" },
  ];

export type MessageType = "text" | "image" | "audio" | "file";
export type MessageStatus = "delivered" | "read";

export interface Message {
  idMessage: string;
  messageBody: string;
  senderId: string;
  receiverId: string;
  timestamp: number;
  type: MessageType;
  fileUrl?: string;
  edited?: boolean;
  status?: MessageStatus;
  reactions?: { [userId: string]: ReactionType };
}

export interface Discussion {
  id: string; 
  participantIds: [string, string];
  backgroundImageUrl?: string | null;
  typing?: { [userId: string]: boolean }; 
  lastMessageText?: string | null;
  lastMessageTimestamp?: number;
  lastMessageSenderId?: string;
  messages: { [idMessage: string]: Message };
  readBy: { [userId: string]: boolean };
}



// "All_Discussions": {
//   "UserA_UserB": {
//     "UserA_isTyping": true,
//     "UserB_isTyping": false,
//     "messages": {
//       "msg1": {
//         "idMessage": "msg1",
//         "messageBody": "Hello world",
//         "senderId": "UserB",
//         "receiverId": "UserA",
//         "time": 1764416557349,
//         type: "text" | "image" | "file";
//         reactions
//       },
//       "msg2": {
//         "idMessage": "msg2",
//         "MessageBody": "How are you?",
//         "sender": "UserA",
//         "receiver": "UserB",
//         "time": 1764416560000,
//          type: "text" | "image" | "file";
//         reactions
//       }
//     }
//   }
// }
