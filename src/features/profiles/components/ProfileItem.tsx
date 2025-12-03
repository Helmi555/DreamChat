import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "types/User";
import { LinearGradient } from "expo-linear-gradient";
import { formatDistanceToNow } from "date-fns";
import { Colors } from "colors";

interface ProfileItemProps {
  user: User;
  onPress?: () => void;
  showStatus?: boolean;
  showLastActive?: boolean;
  variant?: "default" | "compact" | "detailed";
  isSelected?: boolean;
  showIndicator?: boolean;
}

const gradients = [
  ["#FF6F61", "#FFB88C"], // Orange gradient
  ["#6A5ACD", "#836FFF"], // Purple gradient
  ["#20B2AA", "#66CDAA"], // Teal gradient
  ["#FF6347", "#FF7F50"], // Coral gradient
  ["#FFD700", "#FFA500"], // Gold gradient
];

const getGradientColors = (id: string): [string, string] => {
  const index = Math.abs(id.charCodeAt(0) % gradients.length);
  return gradients[index] as [string, string];
};

const ProfileItem: React.FC<ProfileItemProps> = ({
  user,
  onPress,
  showStatus = true,
  showLastActive = true,
  variant = "default",
  isSelected = false,
  showIndicator = false,
}) => {
  const gradientColors = getGradientColors(user.id || user.email);

  const getStatusColor = () => {
    if (!user.isActive) return Colors.textSecondary; // Gray for offline
    return Colors.primaryGreen; // Green for online
  };

  const getStatusText = () => {
    if (!user.isActive) {
      try {
        return `Last seen ${formatDistanceToNow(user.lastActiveAt)} ago`;
      } catch {
        return "Last seen recently";
      }
    }
    return "Online now";
  };

  const getInitials = () => {
    if (user.name && user.lastName)
      return `${user.name.charAt(0)}${user.lastName.charAt(0)}`;
    if (user.name) return user.name.charAt(0);
    if (user.pseudo) return user.pseudo.charAt(0);
    return user.email.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.name) return user.name;
    if (user.pseudo) return user.pseudo;
    return user.email;
  };

  const Container = onPress ? TouchableOpacity : View;

  const containerStyle = [
    variant === "compact"
      ? styles.compactContainer
      : variant === "detailed"
      ? styles.detailedContainer
      : styles.defaultContainer,
    isSelected && styles.selectedContainer, // Apply selected style if true
  ];

  return (
    <Container style={containerStyle} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        {user.profileImageUrl ? (
          <Image
            source={{ uri: user.profileImageUrl }}
            style={
              variant === "compact"
                ? styles.compactAvatar
                : variant === "detailed"
                ? styles.detailedAvatar
                : styles.defaultAvatar
            }
          />
        ) : (
          <LinearGradient
            colors={gradientColors}
            style={
              variant === "compact"
                ? styles.compactGradientAvatar
                : variant === "detailed"
                ? styles.detailedGradientAvatar
                : styles.defaultGradientAvatar
            }
          >
            <Text
              style={
                variant === "compact"
                  ? styles.compactAvatarText
                  : variant === "detailed"
                  ? styles.detailedAvatarText
                  : styles.defaultAvatarText
              }
            >
              {getInitials()}
            </Text>
          </LinearGradient>
        )}
        {showStatus && (
          <View
            style={[
              variant === "compact"
                ? styles.compactStatusBadge
                : variant === "detailed"
                ? styles.detailedStatusBadge
                : styles.defaultStatusBadge,
              { backgroundColor: getStatusColor() },
            ]}
          />
        )}
        {isSelected && (
          <View style={styles.checkmarkContainer}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={Colors.primaryGreen}
            />
          </View>
        )}
      </View>

      <View
        style={
          variant === "compact"
            ? null
            : variant === "detailed"
            ? styles.detailedInfo
            : styles.defaultInfo
        }
      >
        <View style={styles.nameRow}>
          <Text
            style={
              variant === "compact"
                ? styles.compactName
                : variant === "detailed"
                ? styles.detailedName
                : styles.defaultName
            }
          >
            {getDisplayName()}
          </Text>
        </View>

        {variant !== "compact" && (
          <Text
            style={
              variant === "detailed"
                ? styles.detailedEmail
                : styles.defaultEmail
            }
          >
            {user.email}
          </Text>
        )}

        {variant === "detailed" && user.phoneNumber && (
          <View style={styles.phoneRow}>
            <Ionicons
              name="call-outline"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.phone}>{user.phoneNumber}</Text>
          </View>
        )}

        {variant !== "compact" && showLastActive && (
          <View style={styles.statusRow}>
            <Ionicons
              name={user.isActive ? "ellipse" : "time-outline"}
              size={12}
              color={getStatusColor()}
            />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        )}
      </View>

      {variant !== "compact" && (
        <View
          style={
            variant === "detailed" ? styles.actions : styles.defaultActions
          }
        >
          {showIndicator && (
            <Ionicons
              name="chevron-forward"
              size={variant === "detailed" ? 20 : 18}
              color={Colors.textSecondary}
            />
          )}
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  // Compact Variant
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  compactGradientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  compactAvatarText: {
    color: Colors.backgroundLight,
    fontSize: 14,
    fontWeight: "bold",
  },
  compactStatusBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.backgroundLight,
  },
  compactName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },

  // Detailed Variant
  detailedContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.backgroundLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailedAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: Colors.backgroundLight,
  },
  detailedGradientAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.backgroundLight,
  },
  detailedAvatarText: {
    color: Colors.backgroundLight,
    fontSize: 20,
    fontWeight: "bold",
  },
  detailedStatusBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.backgroundLight,
  },
  detailedInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  detailedName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginRight: 8,
  },
  pseudo: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  detailedEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  phone: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
    color: "#333",
  },
  actions: {
    paddingLeft: 8,
  },

  defaultContainer: {
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
  defaultAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  defaultGradientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  defaultAvatarText: {
    color: Colors.backgroundLight,
    fontSize: 16,
    fontWeight: "bold",
  },
  defaultStatusBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.backgroundLight,
  },
  defaultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  defaultName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  defaultPseudo: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginLeft: 6,
  },
  defaultEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  defaultStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  defaultStatusText: {
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 4,
  },
  defaultActions: {
    paddingLeft: 8,
  },

  // Shared
  avatarContainer: {
    position: "relative",
  },
  checkmarkContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
    borderRadius: 12,
  },
});

export default ProfileItem;
