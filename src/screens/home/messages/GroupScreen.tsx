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
import firebase from "configs/firebase";   // compat ONLY
import { User } from "types/User";
import { useNavigation } from "@react-navigation/native";

const GroupScreen: React.FC = () => {
  const [profiles, setProfiles] = React.useState<User[]>([]);
  const navigation = useNavigation();

  React.useEffect(() => {
    const ref = firebase.database().ref("profiles");

    // REAL-TIME LISTENER
    const listener = ref.on("value", (snapshot) => {
      if (!snapshot.exists()) {
        setProfiles([]);
        return;
      }

      const obj = snapshot.val();
      const list = Object.values(obj) as User[];
      setProfiles(list);
    });

    // IMPORTANT: unsubscribe correctly
    return () => ref.off("value", listener);
  }, []);

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
            <View
              key={profile.id}
              style={{
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: Colors.dividerGray,
                justifyContent: "flex-start",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Image
                source={{
                  uri:
                    profile.profileImageUrl ||
                    "https://i.pravatar.cc/150?img=3",
                }}
                style={styles.image}
              />

              <View style={{ marginLeft: 16 }}>
                <Text style={styles.name}>
                  {profile.name} {profile.lastName}
                </Text>
                <Text style={styles.email}>{profile.email}</Text>
              </View>

              <View
                style={{
                  marginLeft: "auto",
                  flexDirection: "row",
                  gap: 22,
                }}
              >
                <Ionicons name="call" size={30} color={Colors.primaryBlue} onPress={handleCall} />
                <Ionicons name="mail" size={30} color={Colors.successGreen} onPress={handleMessage} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default GroupScreen;

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
