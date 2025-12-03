import { db } from "configs/firebase";
import { MessageType } from "types/Chat";
import { Group, GroupMessage, Invitation } from "types/Group";

const GROUPS_PATH = "All_Groups";
const GROUP_MESSAGES_PATH = "Group_Messages";
const INVITATIONS_PATH = "Group_Invitations";

export const groupsService = {
  // Create a new group
  async createGroup(
    creatorId: string,
    groupName: string,
    memberIds: string[]
  ): Promise<string> {
    const groupId = db.ref().child(GROUPS_PATH).push().key;

    if (!groupId) throw new Error("Failed to generate group ID");

    const newGroup: Group = {
      id: groupId,
      name: groupName,
      memberIds: [...memberIds, creatorId],
      groupMessages: {},
      createdBy: creatorId,
      createdAt: Date.now(),
      typing: {},
    };

    await db.ref(`${GROUPS_PATH}/${groupId}`).set(newGroup);
    console.log(`✅ New group created: ${groupId}`);
    return groupId;
  },

  // Send a message to a group
  async sendGroupMessage(
    groupId: string,
    senderId: string,
    messageBody: string,
    type: MessageType = "text",
    fileUrl?: string
  ): Promise<string> {
    const messageId = db.ref().child(GROUP_MESSAGES_PATH).push().key;

    if (!messageId) throw new Error("Failed to generate message ID");

    const message: GroupMessage = {
      idMessage: messageId,
      messageBody,
      senderId,
      receiverId: groupId,
      type,
      timestamp: Date.now(),
      status: "delivered",
    };

    // Save message to group
    await db
      .ref(`${GROUPS_PATH}/${groupId}/groupMessages/${messageId}`)
      .set(message);

    // Update group last message
    await db.ref(`${GROUPS_PATH}/${groupId}`).update({
      lastMessageText: messageBody,
      lastMessageTimestamp: Date.now(),
    });

    console.log(`✅ Message sent to group: ${groupId}`);
    return messageId;
  },

  // Subscribe to group messages (real-time)
  subscribeToGroupMessages(
    groupId: string,
    callback: (messages: GroupMessage[]) => void
  ): () => void {
    const messagesRef = db.ref(`${GROUPS_PATH}/${groupId}/groupMessages`);

    const handleSnapshot = (snapshot: any) => {
      const messagesData = snapshot.val();
      const messages: GroupMessage[] = [];

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

  // Send a group invitation
  async sendInvitation(
    groupId: string,
    senderId: string,
    recipientId: string
  ): Promise<string> {
    const invitationId = db.ref().child(INVITATIONS_PATH).push().key;

    if (!invitationId) throw new Error("Failed to generate invitation ID");

    const invitation: Invitation = {
      id: invitationId,
      groupId,
      senderId,
      recipientId,
      status: "pending",
      timestamp: Date.now(),
    };

    await db.ref(`${INVITATIONS_PATH}/${invitationId}`).set(invitation);
    console.log(`✅ Invitation sent: ${invitationId}`);
    return invitationId;
  },

  // Accept a group invitation
  async acceptInvitation(invitationId: string): Promise<void> {
    const invitationRef = db.ref(`${INVITATIONS_PATH}/${invitationId}`);
    const snapshot = await invitationRef.once("value");

    if (!snapshot.exists()) throw new Error("Invitation not found");

    const invitation: Invitation = snapshot.val();

    // Add recipient to group members
    await db
      .ref(`${GROUPS_PATH}/${invitation.groupId}/memberIds`)
      .push(invitation.recipientId);

    // Update invitation status
    await invitationRef.update({ status: "accepted" });
    console.log(`✅ Invitation accepted: ${invitationId}`);
  },

  // Decline a group invitation
  async declineInvitation(invitationId: string): Promise<void> {
    const invitationRef = db.ref(`${INVITATIONS_PATH}/${invitationId}`);
    const snapshot = await invitationRef.once("value");

    if (!snapshot.exists()) throw new Error("Invitation not found");

    // Update invitation status
    await invitationRef.update({ status: "declined" });
    console.log(`✅ Invitation declined: ${invitationId}`);
  },

  // Subscribe to group invitations (real-time)
  subscribeToInvitations(
    userId: string,
    callback: (invitations: Invitation[]) => void
  ): () => void {
    const invitationsRef = db.ref(INVITATIONS_PATH);

    const handleSnapshot = (snapshot: any) => {
      const invitationsData = snapshot.val();
      const userInvitations: Invitation[] = [];

      if (invitationsData) {
        Object.keys(invitationsData).forEach((key) => {
          const invitation = invitationsData[key];
          if (invitation.recipientId === userId) {
            userInvitations.push(invitation);
          }
        });
        // Sort by timestamp (newest first)
        userInvitations.sort((a, b) => b.timestamp - a.timestamp);
      }

      callback(userInvitations);
    };

    invitationsRef.on("value", handleSnapshot);
    return () => invitationsRef.off("value", handleSnapshot);
  },
};