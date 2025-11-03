import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../../colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ProfileImagePicker from "../../features/settings/components/ProfileImagePicker";
import SettingsRowProps from "../../features/SettingsRowProps ";
import { RootStackParamList } from "../../../App";

const settingsOptions = [
  {
    iconName: "person",
    title: "Edit Profile",
    description: "Change your profile information",
  },
  {
    iconName: "lock-closed",
    title: "Change Password",
    description: "Update your account password",
  },
  {
    iconName: "notifications",
    title: "Notifications",
    description: "Manage your notification preferences",
  },
  {
    iconName: "newspaper",
    title: "Terms of Service",
    description: "Read our terms and conditions",
  },
  {
    iconName: "accessibility",
    title: "Help & Support",
    description: "Get assistance and find FAQs",
  },
  {
    iconName: "information-circle",
    title: "App information",
    description: "Version, licenses, and more",
  },
  {
    iconName: "share-social",
    title: "Invite a Friend",
    description: "Share the app with your friends",
  },
];

const MyAccountScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const onBackPress = () => {};

  const onLogoutPress = () => {
    navigation.navigate("Login");
  };
 

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      {/*Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={navigation.goBack} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={30} color={"#000"} />
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>

        <TouchableOpacity onPress={onLogoutPress} activeOpacity={0.6}>
          <Ionicons name="log-out-outline" size={32} color={"#000"} />
        </TouchableOpacity>
      </View>

      {/* ProfileCard */}
      <View style={styles.profileCardContainer}>
        <ProfileImagePicker />
        <Text style={styles.nameTitle}>Helmi Ben Abdelghani</Text>
        <Text style={styles.nameDescription}>What's happening?</Text>
      </View>

      {/* Actions */}

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
              onPress={() => console.log(`${item.title} pressed`)}
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
export default MyAccountScreen;

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
    flex: 2,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",

    // borderWidth: 2,
    borderColor: "orange",
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
