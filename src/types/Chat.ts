export type ReactionType = "like" | "love" | "laugh" | "sad" | "angry" | "surprised";

export interface Reaction {
  userId: string;
  type: ReactionType;
}

export type MessageType = "text" | "image" | "file";
export type MessageStatus =  "delivered" | "read";

export interface Message {
  idMessage: string;
  messageBody: string;
  senderId: string;
  receiverId: string;
  timestamp: number;
  type: MessageType;
  edited?: boolean;
  status?: MessageStatus;
  reactions?: { [userId: string]: ReactionType };
}

export interface Discussion {
  id: string; // e.g., "UserA_UserB"
  participantIds: [string, string];//not needed coz the id already has both userids concat by sorted and "_"
  backgroundImageUrl?: string;
  typing?: { [userId: string]: boolean };//should be like userid_typing
  lastMessageText?: string;
  lastMessageTimestamp?: number;
  lastMessageSenderId?: string;
  messages: { [idMessage: string]: Message };
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
