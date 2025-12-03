import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "colors";
import { Group } from "types/Group";

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
  const gradientColors = getGradientColors(group.id);

  const getInitials = () => {
    if (group.name) return group.name.charAt(0).toUpperCase();
    return "G";
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {group.imageUrl ? (
          <Image source={{ uri: group.imageUrl }} style={styles.avatar} />
        ) : (
          <LinearGradient colors={gradientColors} style={styles.gradientAvatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </LinearGradient>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.groupName} numberOfLines={1}>
          {group.name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 6,
            gap: 6,
          }}
        >
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
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
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
  infoContainer: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  participants: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  iconContainer: {
    paddingLeft: 8,
  },
});
