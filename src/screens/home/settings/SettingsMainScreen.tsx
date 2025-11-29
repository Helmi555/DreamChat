import * as React from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
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
import { signOut } from "firebase/auth";
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

const onLogoutPress = async () => {
  console.log("🔄 Logout pressed - starting logout process");
  
  // Get UID from context instead of auth.currentUser (which is undefined during logout)
  const uid = currentUser?.id;
  console.log("👤 Current user UID from context:", uid);
  
  if (!uid) {
    console.log("❌ No user UID found from context, trying auth.currentUser");
    // Fallback to auth.currentUser
    const authUid = auth.currentUser?.uid;
    if (authUid) {
      console.log("✅ Found UID from auth.currentUser:", authUid);
      // Use the auth UID
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
    // 2️⃣ sign out
    await auth.signOut();
    console.log("✅ Firebase sign out successful");

    console.log("🗑️ Removing user from local storage");
    // 3️⃣ remove local storage
    await AsyncStorage.removeItem(rememberedUserKey);
    console.log("✅ Local storage cleared");

    console.log("🔄 Navigating to Login screen");
    // 4️⃣ navigate
    navigation.replace("Login");
    console.log("✅ Navigation to Login completed");
    
  } catch (err) {
    console.error("❌ Logout failed with error:", err);
  }
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
        {currentUser?.profileImageUrl ? (
          <Image
            source={{ uri: currentUser.profileImageUrl }}
            style={styles.profileImage}
          />
        ) : (
          <Ionicons name="person" size={120} color={Colors.textSecondary} />
        )}
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
        </ScrollView>
      </View>
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
    //borderWidth:2,
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
    // backgroundColor: "yellow",
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    paddingTop: 10,
    // borderWidth:2,
    // borderColor: "orange",
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
});
