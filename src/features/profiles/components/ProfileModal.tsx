import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "colors";
import CircleAvatar from "features/shared/components/elements/CircleAvatar";
import { LinearGradient } from "expo-linear-gradient";
import { User } from "types/User";

const { width, height } = Dimensions.get("window");

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: User;
  onChatPress: () => void;
  isLoading?: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  profile,
  onChatPress,
    isLoading=false,
}) => {
  const scaleValue = React.useRef(new Animated.Value(0.8)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleValue.setValue(0.8);
      opacityValue.setValue(0);
      translateY.setValue(50);
    }
  }, [visible]);

  if (!profile) return null;

  const getInitials = () => {
    if (profile.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    if (profile.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getStatusColor = () => {
    return profile.isActive ? "#34C759" : "#aaaaaaff";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleValue }, { translateY: translateY }],
              opacity: opacityValue,
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <View style={styles.closeButtonInner}>
              <Ionicons name="close" size={22} color="#2D3748" />
            </View>
          </TouchableOpacity>

          {/* Profile Header with Gradient */}
          <LinearGradient
            colors={["#25D366", "#128C7E"]}



            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}
          >
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarWrapper, { borderColor: getStatusColor()}]}>
                {profile.profileImageUrl ? (
                  <Image
                    source={{ uri: profile.profileImageUrl }}
                    style={[styles.detailedAvatar]}
                  />
                ) : (
                    <CircleAvatar size={100} letter={getInitials()}/>
                )}
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor() },
                  ]}
                />
              </View>

              <Text style={styles.profileName}>
                {profile.name || "Anonymous User"}
                {profile.lastName && ` ${profile.lastName}`}
              </Text>

              <Text style={styles.profilePseudo}>
                @{profile.pseudo || "user"}
              </Text>

              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={14} color="#fff" />
                  <Text style={styles.badgeText}>Verified</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Profile Details */}
          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Contact Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Contact Information</Text>

              <View style={styles.detailRow}>
                <LinearGradient
                  colors={["#36D1DC", "#5B86E5"]}
                  style={styles.iconContainer}
                >
                  <Ionicons name="mail-outline" size={20} color="#fff" />
                </LinearGradient>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.profileDetailValue} numberOfLines={1}>
                    {profile.email || "Not provided"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <LinearGradient
                  colors={["#FF9A9E", "#FAD0C4"]}
                  style={styles.iconContainer}
                >
                  <Ionicons name="call-outline" size={20} color="#fff" />
                </LinearGradient>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.profileDetailValue}>
                    {profile.phoneNumber || "Not provided"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <LinearGradient
                  colors={["#A3BFFA", "#6991C7"]}
                  style={styles.iconContainer}
                >
                  <Ionicons name="person-outline" size={20} color="#fff" />
                </LinearGradient>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Username</Text>
                  <Text style={styles.profileDetailValue}>
                    @{profile.pseudo || "Not set"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Card */}
            <View style={styles.statsCard}>
              <Text style={styles.sectionTitle}>Profile Stats</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    style={styles.statIcon}
                  >
                    <Ionicons
                      name="chatbubbles-outline"
                      size={20}
                      color="#fff"
                    />
                  </LinearGradient>
                  <Text style={styles.statNumber}>24</Text>
                  <Text style={styles.statLabel}>Chats</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <LinearGradient
                    colors={["#36D1DC", "#5B86E5"]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="time-outline" size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.statNumber}>89%</Text>
                  <Text style={styles.statLabel}>Response</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <LinearGradient
                    colors={["#FF9A9E", "#FAD0C4"]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="flash-outline" size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.statNumber}>7d</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton]}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#E3F2FD", "#BBDEFB"]}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="call-outline" size={22} color="#1976D2" />
                  <Text style={styles.callButtonText}>Call</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.videoButton]}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#E8F5E9", "#C8E6C9"]}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="videocam-outline" size={22} color="#388E3C" />
                  <Text style={styles.videoButtonText}>Video</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Floating Chat Button */}
          <TouchableOpacity
            style={styles.chatButton}
            onPress={onChatPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#25D366", "#128C7E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.chatButtonGradient}
            >
              <View style={styles.chatButtonContent}>
                <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
                <Text style={styles.chatButtonText}>Start Chat</Text>
                <View style={styles.chatButtonArrow}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  )}    
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientHeader: {
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 20,
    borderWidth:2,
    borderRadius: 50,
  },
  detailedAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
  },
  gradientAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  statusDot: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  profilePseudo: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
    fontWeight: "500",
  },
  badgeContainer: {
    flexDirection: "row",
    marginTop: 5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modalBody: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 4,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  profileDetailValue: {
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "500",
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2D3748",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E2E8F0",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 28,
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  actionButtonGradient: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  callButton: {
    borderColor: "#E2E8F0",
  },
  videoButton: {
    borderColor: "#E2E8F0",
  },
  callButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "700",
  },
  videoButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#388E3C",
    fontWeight: "700",
  },
  chatButton: {
    marginHorizontal: 20,
    marginBottom: 15,
    marginTop: 10,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  chatButtonGradient: {
    paddingVertical: 18,
  },
  chatButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chatButtonText: {
    marginLeft: 10,
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  chatButtonArrow: {
    position: "absolute",
    right: 20,
  },
});

export default ProfileModal;
