import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
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

const gradients = [
  ["#FF6F61", "#FFB88C"],
  ["#6A5ACD", "#836FFF"],
  ["#20B2AA", "#66CDAA"],
  ["#FF6347", "#FF7F50"],
  ["#FFD700", "#FFA500"],
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

  // Determine admin by `createdBy` (use your schema here if different)
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
            >
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </LinearGradient>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
          <View style={styles.participantRow}>
            <Ionicons name="people" size={20} color={Colors.textSecondary} />
            <Text style={styles.participants}>
              {group.memberIds.length} participant
              {group.memberIds.length !== 1 ? "s" : ""}
            </Text>
          </View>
          {group.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {group.lastMessage}
            </Text>
          )}
        </View>

        <View style={styles.iconContainer}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={() => {}}
          >
            <Text style={{ fontSize: 16, marginBottom: 12 }}>
              Options for {group.name}
            </Text>

            {isAdmin ? (
              <Pressable
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  setEditModalVisible(true);
                }}
              >
                <Text style={{ color: "#fff" }}>Edit Group</Text>
              </Pressable>
            ) : (
              <Text style={{ color: Colors.textSecondary, marginBottom: 8 }}>
                Participant options
              </Text>
            )}

            {isAdmin ? (
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#d9534f" }]}
                onPress={() => {
                  Alert.alert(
                    "Delete Group",
                    `Are you sure you want to delete ${group.name}? This cannot be undone.`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await db.ref(`All_Groups/${group.id}`).remove();
                            setModalVisible(false);
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
                <Text style={{ color: "#fff" }}>Delete Group</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#f39c12" }]}
                onPress={() => {
                  // leave group
                  Alert.alert(
                    "Leave Group",
                    `Do you want to leave ${group.name}?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Leave",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            const updated = (group.memberIds || []).filter(
                              (id) => id !== currentUser?.id
                            );
                            await db
                              .ref(`All_Groups/${group.id}/memberIds`)
                              .set(updated);
                            setModalVisible(false);
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
                <Text style={{ color: "#fff" }}>Leave Group</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.modalButton, { backgroundColor: "#aaa" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </Pressable>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Edit Modal (admin only) */}
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
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalContent, { width: 320 }]}
            onPress={() => {}}
          >
            <Text style={{ fontSize: 16, marginBottom: 8 }}>Edit Group</Text>

            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
              Name
            </Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={{
                borderWidth: 1,
                borderColor: "#e5e5e5",
                padding: 8,
                borderRadius: 8,
                marginBottom: 8,
              }}
            />

            <Text
              style={{
                fontSize: 12,
                color: Colors.textSecondary,
                marginBottom: 6,
              }}
            >
              Members
            </Text>
            <View style={{ maxHeight: 140 }}>
              {members.map((m) => (
                <View
                  key={m}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 6,
                  }}
                >
                  <Text>{m}</Text>
                  <Pressable
                    onPress={() => {
                      // remove member locally
                      const updated = members.filter((mm) => mm !== m);
                      setMembers(updated);
                    }}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: "#eee",
                      borderRadius: 6,
                    }}
                  >
                    <Text>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <TextInput
              placeholder="Add member by userId"
              value={newMemberId}
              onChangeText={setNewMemberId}
              style={{
                borderWidth: 1,
                borderColor: "#e5e5e5",
                padding: 8,
                borderRadius: 8,
                marginTop: 8,
                marginBottom: 8,
              }}
            />
            <Pressable
              onPress={() => {
                if (!newMemberId) return;
                if (members.includes(newMemberId)) {
                  Alert.alert("Info", "Member already present");
                  return;
                }
                setMembers((prev) => [...prev, newMemberId]);
                setNewMemberId("");
              }}
              style={[
                styles.modalButton,
                { backgroundColor: Colors.primaryGreen },
              ]}
            >
              <Text style={{ color: "#fff" }}>Add Member</Text>
            </Pressable>

            <View
              style={{
                flexDirection: "row",
                marginTop: 12,
                justifyContent: "space-between",
              }}
            >
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: "#aaa", flex: 1, marginRight: 8 },
                ]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: "#fff" }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: Colors.primaryGreen, flex: 1 },
                ]}
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
                <Text style={{ color: "#fff" }}>Save</Text>
              </Pressable>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </Pressable>
  );
};

export default GroupItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.backgroundLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarContainer: { marginRight: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  gradientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: Colors.backgroundLight,
    fontSize: 20,
    fontWeight: "bold",
  },
  infoContainer: { flex: 1 },
  groupName: { fontSize: 16, fontWeight: "bold", color: Colors.textPrimary },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  participants: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  lastMessage: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  iconContainer: { paddingLeft: 8 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 250,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  modalButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
});
