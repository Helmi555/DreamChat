import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "colors";
import { Group } from "types/Group";
import { useUser } from "context/UserContext";
import { db } from "configs/firebase";
import { Alert, TextInput } from "react-native";

interface GroupItemProps {
  group: Group;
  onPress?: () => void;
}

const { width } = Dimensions.get("window");

const gradients = [
  ["#075E54", "#128C7E"], // WhatsApp Green
  ["#667eea", "#764ba2"], // Purple
  ["#f093fb", "#f5576c"], // Pink
  ["#4facfe", "#00f2fe"], // Blue
  ["#43e97b", "#38f9d7"], // Green
  ["#fa709a", "#fee140"], // Sunset
];

const getGradientColors = (id: string): [string, string] => {
  const index = Math.abs(id.charCodeAt(0) % gradients.length);
  return gradients[index] as [string, string];
};

const GroupItem: React.FC<GroupItemProps> = ({ group, onPress }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(group.name || "");
  const [members, setMembers] = useState<string[]>(group.memberIds || []);
  const [newMemberId, setNewMemberId] = useState("");
  const gradientColors = getGradientColors(group.id);
  const { currentUser } = useUser();

  const isAdmin = Boolean(
    currentUser?.id && group.createdBy === currentUser.id
  );

  useEffect(() => {
    setEditName(group.name || "");
    setMembers(group.memberIds || []);
  }, [group.name, group.memberIds]);

  const getInitials = () => {
    if (group.name) return group.name.charAt(0).toUpperCase();
    return "G";
  };

  return (
    <Pressable onPress={() => setModalVisible(false)}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        onLongPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {group.imageUrl ? (
            <Image source={{ uri: group.imageUrl }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={gradientColors}
              style={styles.gradientAvatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </LinearGradient>
          )}
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.groupName} numberOfLines={1}>
              {group.name}
            </Text>
            {isAdmin && (
              <View style={styles.adminLabel}>
                <Text style={styles.adminLabelText}>Admin</Text>
              </View>
            )}
          </View>
          
          <View style={styles.participantRow}>
            <Ionicons name="people" size={16} color="#128C7E" />
            <Text style={styles.participants}>
              {group.memberIds.length} member{group.memberIds.length !== 1 ? "s" : ""}
            </Text>
            <View style={styles.dotSeparator} />
            <Ionicons name="time" size={14} color="#666" />
            <Text style={styles.lastSeen}>
              {group.lastMessageTimestamp 
                ? new Date(group.lastMessageTimestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
                : 'New group'
              }
            </Text>
          </View>
          
          {group.lastMessage && (
            <View style={styles.lastMessageRow}>
              <Ionicons name="chatbubble" size={14} color="#666" style={{ marginRight: 4 }} />
              <Text style={styles.lastMessage} numberOfLines={1}>
                {group.lastMessageText}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.iconContainer}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#128C7E"
          />
        </View>
      </TouchableOpacity>

      {/* Action Modal - WhatsApp Style */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.actionSheetContainer}>
            <LinearGradient
              colors={["#075E54", "#128C7E"]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalHeaderTitle}>{group.name}</Text>
              <Text style={styles.modalHeaderSubtitle}>
                {group.memberIds.length} members • {isAdmin ? "Group Admin" : "Member"}
              </Text>
            </LinearGradient>
            
            <View style={styles.actionSheetContent}>
              {isAdmin ? (
                <>
                  <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => {
                      setModalVisible(false);
                      setEditModalVisible(true);
                    }}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                      <Ionicons name="create-outline" size={22} color="#1976D2" />
                    </View>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionTitle}>Edit Group</Text>
                      <Text style={styles.actionSubtitle}>Change name, add/remove members</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => {
                      setModalVisible(false);
                      Alert.alert(
                        "Delete Group",
                        `Are you sure you want to delete "${group.name}"? This action cannot be undone and all messages will be lost.`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete Group",
                            style: "destructive",
                            onPress: async () => {
                              try {
                                await db.ref(`All_Groups/${group.id}`).remove();
                              } catch (err) {
                                console.error("Error deleting group:", err);
                                Alert.alert("Error", "Failed to delete group.");
                              }
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
                      <Ionicons name="trash-outline" size={22} color="#F44336" />
                    </View>
                    <View style={styles.actionTextContainer}>
                      <Text style={[styles.actionTitle, { color: '#F44336' }]}>Delete Group</Text>
                      <Text style={styles.actionSubtitle}>Permanently delete this group</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => {
                    setModalVisible(false);
                    Alert.alert(
                      "Leave Group",
                      `Do you want to leave "${group.name}"? You can only rejoin if invited.`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Leave Group",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              const updated = (group.memberIds || []).filter(
                                (id) => id !== currentUser?.id
                              );
                              await db
                                .ref(`All_Groups/${group.id}/memberIds`)
                                .set(updated);
                            } catch (err) {
                              console.error("Error leaving group:", err);
                              Alert.alert("Error", "Failed to leave group.");
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                    <Ionicons name="exit-outline" size={22} color="#FF9800" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={[styles.actionTitle, { color: '#FF9800' }]}>Leave Group</Text>
                    <Text style={styles.actionSubtitle}>Exit this group chat</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => setModalVisible(false)}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#F5F5F5' }]}>
                  <Ionicons name="close-circle" size={22} color="#666" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Cancel</Text>
                  <Text style={styles.actionSubtitle}>Close this menu</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        transparent
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setEditModalVisible(false)}
        >
          <View style={styles.editModalContainer}>
            <LinearGradient
              colors={["#075E54", "#128C7E"]}
              style={styles.editModalHeader}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.editModalTitle}>Edit Group</Text>
              <View style={{ width: 40 }} />
            </LinearGradient>

            <View style={styles.editModalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Group Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="people" size={20} color="#128C7E" style={styles.inputIcon} />
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    style={styles.textInput}
                    placeholder="Enter group name"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.inputLabel}>Group Members</Text>
                  <Text style={styles.memberCount}>{members.length} members</Text>
                </View>
                
                <View style={styles.membersList}>
                  {members.map((memberId) => (
                    <View key={memberId} style={styles.memberItem}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberInitial}>
                          {memberId.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberId} numberOfLines={1}>
                          {memberId}
                        </Text>
                        {memberId === group.createdBy && (
                          <View style={styles.creatorBadge}>
                            <Text style={styles.creatorText}>Creator</Text>
                          </View>
                        )}
                      </View>
                      {memberId !== currentUser?.id && (
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              "Remove Member",
                              `Remove ${memberId} from group?`,
                              [
                                { text: "Cancel", style: "cancel" },
                                {
                                  text: "Remove",
                                  style: "destructive",
                                  onPress: () => {
                                    const updated = members.filter((mm) => mm !== memberId);
                                    setMembers(updated);
                                  },
                                },
                              ]
                            );
                          }}
                          style={styles.removeButton}
                        >
                          <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>

                <View style={styles.addMemberContainer}>
                  <View style={styles.addMemberInputContainer}>
                    <Ionicons name="person-add" size={20} color="#128C7E" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Add member by user ID"
                      value={newMemberId}
                      onChangeText={setNewMemberId}
                      style={[styles.textInput, { flex: 1 }]}
                      placeholderTextColor="#999"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (!newMemberId.trim()) return;
                      if (members.includes(newMemberId)) {
                        Alert.alert("Info", "Member already in group");
                        return;
                      }
                      setMembers((prev) => [...prev, newMemberId.trim()]);
                      setNewMemberId("");
                    }}
                    style={styles.addButton}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.editModalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={async () => {
                    try {
                      await db.ref(`All_Groups/${group.id}`).update({
                        name: editName,
                        memberIds: members,
                      });
                      setEditModalVisible(false);
                      setModalVisible(false);
                    } catch (err) {
                      console.error("Error updating group:", err);
                      Alert.alert("Error", "Failed to update group.");
                    }
                  }}
                >
                  <LinearGradient
                    colors={["#075E54", "#128C7E"]}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#075E54",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  avatarContainer: {
    marginRight: 16,
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#E8F5E9",
  },
  gradientAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8F5E9",
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  adminBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#128C7E",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  infoContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  groupName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#075E54",
    marginRight: 8,
    flex: 1,
  },
  adminLabel: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#128C7E",
  },
  adminLabelText: {
    fontSize: 11,
    color: "#128C7E",
    fontWeight: "600",
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  participants: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    marginRight: 12,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    marginHorizontal: 8,
  },
  lastSeen: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  lastMessageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  iconContainer: {
    paddingLeft: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  actionSheetContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: "80%",
  },
  modalHeader: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  modalHeaderSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  actionSheetContent: {
    padding: 20,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#075E54",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#666",
  },

  // Edit Modal Styles
  editModalContainer: {
    width: width * 0.9,
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: "10%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  editModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  editModalContent: {
    padding: 20,
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#075E54",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  memberCount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  membersList: {
    maxHeight: 150,
    marginBottom: 16,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#075E54",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberInitial: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  memberInfo: {
    flex: 1,
  },
  memberId: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  creatorBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  creatorText: {
    fontSize: 10,
    color: "#128C7E",
    fontWeight: "600",
  },
  removeButton: {
    padding: 6,
  },
  addMemberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addMemberInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },
  addButton: {
    backgroundColor: "#075E54",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  editModalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  saveButton: {
    overflow: "hidden",
  },
  saveButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default GroupItem;