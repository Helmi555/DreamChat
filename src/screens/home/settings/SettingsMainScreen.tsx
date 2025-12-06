import * as React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  Modal,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ProfileImagePicker from "features/settings/components/ProfileImagePicker";
import SettingsRowProps from "features/settings/components/SettingsRowProps";
import { RootStackParamList } from "@/../../App";
import {
  signOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import app, { auth, db } from "configs/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "context/UserContext";
import { Database, get, getDatabase, ref } from "firebase/database";
import { User } from "types/User";

const rememberedUserKey = "rememberedUser";

const settingsOptions = [
  {
    iconName: "person",
    title: "Edit Profile",
    routeName: "EditProfile",
    description: "Change your profile information",
  },
  {
    iconName: "lock-closed",
    title: "Change Password",
    routeName: "StayTuned",
    description: "Update your account password",
  },
  {
    iconName: "notifications",
    title: "Notifications",
    routeName: "StayTuned",
    description: "Manage your notification preferences",
  },
  {
    iconName: "newspaper",
    title: "Terms of Service",
    routeName: "StayTuned",
    description: "Read our terms and conditions",
  },
  {
    iconName: "accessibility",
    title: "Help & Support",
    routeName: "StayTuned",
    description: "Get assistance and find FAQs",
  },
  {
    iconName: "information-circle",
    title: "App information",
    routeName: "StayTuned",
    description: "Version, licenses, and more",
  },
  {
    iconName: "share-social",
    title: "Invite a Friend",
    routeName: "StayTuned",
    description: "Share the app with your friends",
  },
];

const SettingsMainScreen: React.FC = () => {
  const { currentUser } = useUser();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteUsername, setDeleteUsername] = React.useState("");
  const [deletePassword, setDeletePassword] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  const onLogoutPress = async () => {
    console.log("🔄 Logout pressed - starting logout process");

    const uid = currentUser?.id;
    console.log("👤 Current user UID from context:", uid);

    if (!uid) {
      console.log("❌ No user UID found from context, trying auth.currentUser");
      const authUid = auth.currentUser?.uid;
      if (authUid) {
        console.log("✅ Found UID from auth.currentUser:", authUid);
        try {
          console.log("📝 Updating user status to inactive in database");
          await db.ref(`profiles/${authUid}`).update({
            isActive: false,
            lastActiveAt: Date.now(),
          });
          console.log("✅ User status updated to inactive");
        } catch (err) {
          console.error("❌ Failed to update user status:", err);
        }
      }
    } else {
      try {
        console.log("📝 Updating user status to inactive in database");
        await db.ref(`profiles/${uid}`).update({
          isActive: false,
          lastActiveAt: Date.now(),
        });
        console.log("✅ User status updated to inactive");
      } catch (err) {
        console.error("❌ Failed to update user status:", err);
      }
    }

    try {
      console.log("🚪 Signing out from Firebase Auth");
      await auth.signOut();
      console.log("✅ Firebase sign out successful");

      console.log("🗑️ Removing user from local storage");
      await AsyncStorage.removeItem(rememberedUserKey);
      console.log("✅ Local storage cleared");

      console.log("🔄 Navigating to Login screen");
      navigation.replace("Login");
      console.log("✅ Navigation to Login completed");
    } catch (err) {
      console.error("❌ Logout failed with error:", err);
    }
  };

  const openDeleteAccountModal = () => {
    setDeleteUsername("");
    setDeletePassword("");
    setShowDeleteModal(true);
  };

  const closeDeleteAccountModal = () => {
    setShowDeleteModal(false);
  };

  const handleSendDelete = async () => {
    Keyboard.dismiss();

    // give the keyboard time to fully hide before showing the system Alert
    await new Promise<void>((res) => setTimeout(() => res(), 120));

    if (!deletePassword) {
      Alert.alert("Validation", "Please enter your password.");
      return;
    }

    Alert.alert(
      "Confirm deletion",
      "This action is irreversible. Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);

              const fbUser = auth.currentUser;
              if (!fbUser) {
                Alert.alert("Error", "No authenticated user found.");
                return;
              }

              const email =
                fbUser.email || currentUser?.email || deleteUsername;
              const credential = EmailAuthProvider.credential(
                email,
                deletePassword
              );

              await reauthenticateWithCredential(fbUser, credential);
              await deleteUser(fbUser);

              await AsyncStorage.removeItem(rememberedUserKey);
              setShowDeleteModal(false);
              Alert.alert("Account Deleted", "Your account has been deleted.");
              navigation.replace("Login");
            } catch (err: any) {
              console.error("Delete failed:", err);
              if (err?.code === "auth/wrong-password") {
                Alert.alert("Authentication Failed", "Incorrect password.");
              } else if (err?.code === "auth/requires-recent-login") {
                Alert.alert(
                  "Authentication Required",
                  "Please sign in again and try deleting your account."
                );
              } else {
                Alert.alert("Error", "Failed to delete account. Try again.");
              }
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={navigation.goBack} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={30} color={"#000"} />
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>

        <TouchableOpacity onPress={onLogoutPress} activeOpacity={0.6}>
          <Ionicons name="log-out-outline" size={32} color={"#000"} />
        </TouchableOpacity>
      </View>

      {/* profile card */}
      <View style={styles.profileCardContainer}>
        <View style={styles.profileImageContainer}>
          {currentUser?.profileImageUrl ? (
            <Image
              source={{ uri: currentUser.profileImageUrl }}
              style={styles.profileImage}
            />
          ) : (
            <Ionicons name="person" size={80} color={Colors.textSecondary} />
          )}
        </View>
        <Text style={styles.nameTitle}>
          {currentUser?.name && currentUser.lastName
            ? `${currentUser.name} ${currentUser.lastName}`
            : currentUser?.email}
        </Text>
        <Text style={styles.nameDescription}>What's happening?</Text>
      </View>

      <View style={styles.actionsContainer}>
        <ScrollView
          style={{ flexGrow: 1, width: "100%", height: "100%" }}
          showsVerticalScrollIndicator={false}
        >
          {settingsOptions.map((item, index) => (
            <SettingsRowProps
              key={index}
              iconName={item.iconName as any}
              title={item.title}
              description={item.description}
              onPress={() => {
                console.log(`${item.title} pressed`);
                item.routeName
                  ? navigation.navigate(item.routeName as any, {
                      screenTitle: item.title,
                    })
                  : null;
              }}
            />
          ))}
          <SettingsRowProps
            iconName={"trash"}
            iconColor={Colors.errorRed}
            titleColor={Colors.errorRed}
            title={"Delete Account"}
            description={"Delete your account permanently"}
            onPress={openDeleteAccountModal}
          />
        </ScrollView>
      </View>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="slide"
        onRequestClose={closeDeleteAccountModal}
      >
        <TouchableWithoutFeedback onPress={closeDeleteAccountModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Delete Account</Text>
                  <TouchableOpacity onPress={closeDeleteAccountModal}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={currentUser?.email || ""}
                  autoCapitalize="none"
                  editable={false}
                  autoCorrect={false}
                />

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                  Password
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  secureTextEntry
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={closeDeleteAccountModal}
                    disabled={isDeleting}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.sendButton]}
                    onPress={() => {
                      Keyboard.dismiss();
                      handleSendDelete();
                    }}
                    disabled={isDeleting}
                  >
                    <Text style={styles.sendText}>
                      {isDeleting ? "Sending..." : "Send"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};
export default SettingsMainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: Colors.backgroundLight,
    borderColor: "red",
    justifyContent: "space-between",
  },
  headerContainer: {
    height: "10%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  profileCardContainer: {
    alignItems: "center",
    paddingVertical: 24,
    position: "relative",
    borderWidth: 0,
  },

  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.filterActiveBg,
    overflow: "hidden",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.filterActiveBg,
    overflow: "hidden",
    marginBottom: 10,
  },
  actionsContainer: {
    flex: 4,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    paddingTop: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  nameTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  nameDescription: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "400",
    color: Colors.textSecondary,
  },

  /* Modal styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  inputLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.filterActiveBg,
    paddingHorizontal: 12,
    backgroundColor: Colors.backgroundLight,
    color: Colors.textPrimary,
  },
  modalActions: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    minWidth: 100,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: Colors.errorRed,
  },
  cancelText: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  sendText: {
    color: "#fff",
    fontWeight: "700",
  },
});
