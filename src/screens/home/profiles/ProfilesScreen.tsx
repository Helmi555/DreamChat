import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Colors } from "colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import firebase, { auth } from "configs/firebase";   // compat ONLY
import { User } from "types/User";
import { useNavigation } from "@react-navigation/native";
import ProfileItem from "features/profiles/components/ProfileItem";
import { useUser } from "context/UserContext";


const ProfilesScreen: React.FC = () => {
  const [profiles, setProfiles] = React.useState<User[]>([]);
  const navigation = useNavigation();
  const { currentUser } = useUser();

  React.useEffect(() => {
    if (!currentUser?.id) return;

    // Get all profiles then filter in memory (Firebase RTDB doesn't support != queries easily)
    const ref = firebase.database().ref("profiles");

    const listener = ref.on("value", (snapshot) => {
      if (!snapshot.exists()) {
        setProfiles([]);
        return;
      }

      const obj = snapshot.val();
      const list = Object.values(obj) as User[];
      
      // Double-check filtering
      const filteredProfiles = list.filter(profile => {
        const isCurrentUser = profile.id === currentUser.id;
        if (isCurrentUser) {
          console.log(`❌ Removing current user: ${profile.email}`);
        }
        return !isCurrentUser;
      }).sort((a, b) => a.email.localeCompare(b.email));
      
      setProfiles(filteredProfiles);
    });

    return () => ref.off("value", listener);
  }, [currentUser?.id]);

  const handleCall = () => {};
  const handleMessage = () => navigation.navigate("MessagesScreen" as never);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Profiles</Text>
      </View>

      <View style={styles.actionsContainer}>
        <ScrollView
          style={{ flexGrow: 1, width: "100%", height: "100%" }}
          showsVerticalScrollIndicator={false}
        >
          {profiles.map((profile) => (
           <ProfileItem key={profile.id} user={profile} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProfilesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  headerContainer: {
    height: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
  actionsContainer: {
    flex: 4,
    width: "100%",
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  email: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.textSecondary,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 55,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.8)",
  },
});
