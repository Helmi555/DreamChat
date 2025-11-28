import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  BackHandler,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ToastAndroid,
} from "react-native";
import WaveBackground from "./components/WaveBackground";
import { Colors } from "colors";
import { Ionicons } from "@expo/vector-icons";
import GradientButton from "features/shared/components/buttons/GradientButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import app from "configs/firebase";
import { User } from "types/User";
import firebase from "configs/firebase"; // your compat init file
import { useUser } from "context/UserContext";

const PROFILES = "profiles";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const onExitPress = () => BackHandler.exitApp();
  const db = firebase.database();
  const { setCurrentUser } = useUser();
  const onSubmitPress = async () => {
    if (!username || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      Keyboard.dismiss();
      setError("");

      // 1️⃣ Create Auth user using compat
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(username, password);

      const user = userCredential.user;
      if (!user) return;

      // 2️⃣ Build full profile
      const newUser: User = {
        id: user.uid,
        email: user.email!,
        pseudo: "",
        name: "", // optional: collect from form
        lastName: "",
        phoneNumber: "",
        profileImageUrl: "",
      };

      // 3️⃣ Store profile in Realtime DB
      await firebase.database().ref(`profiles/${user.uid}`).set(newUser);

      // 4️⃣ Save locally for offline use
      await AsyncStorage.setItem("rememberedUser", JSON.stringify(newUser));

      // 5️⃣ Update context
      setCurrentUser(newUser);

      // 6️⃣ Toast + navigation
      ToastAndroid.show(
        `${user.email} registered successfully!`,
        ToastAndroid.SHORT
      );
      setTimeout(() => navigation.replace("Home"), 2200);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else {
        setError(error.message);
      }
    }
  };

  const onLoginPress = () => navigation.replace("Login");

  return (
    <WaveBackground>
      <SafeAreaView style={[styles.safeArea, { paddingBottom: insets.bottom }]}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              <View style={styles.topContainer}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.titleDescription}>
                  {" "}
                  Please create a{" "}
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    DreamChat
                  </Text>{" "}
                  account
                </Text>
              </View>

              <View style={styles.bottomContainer}>
                <View style={styles.card}>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="mail-outline"
                      size={22}
                      color={Colors.textThirdly}
                    />
                    <TextInput
                      style={styles.input}
                      keyboardType="email-address"
                      placeholder="Enter email"
                      placeholderTextColor={Colors.textThirdly}
                      value={username}
                      onChangeText={(text) => {
                        setError("");
                        setUsername(text);
                      }}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={22}
                      color={Colors.textThirdly}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter password"
                      placeholderTextColor={Colors.textThirdly}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={(pass) => {
                        setError("");
                        setPassword(pass);
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color={Colors.textThirdly}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={22}
                      color={Colors.textThirdly}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm password"
                      placeholderTextColor={Colors.textThirdly}
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={(pass) => {
                        setError("");
                        setConfirmPassword(pass);
                      }}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={22}
                        color={Colors.textThirdly}
                      />
                    </TouchableOpacity>
                  </View>

                  {error ? <Text style={styles.errorText}>{error}</Text> : null}

                  <View style={styles.buttonRow}>
                    <GradientButton
                      text="Sign Up"
                      iconName="person-add"
                      iconSize={20}
                      onPress={onSubmitPress}
                      width="45%"
                      height={46}
                      loading={false}
                    />
                  </View>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Already have an account?
                  </Text>
                  <TouchableOpacity onPress={onLoginPress} activeOpacity={0.8}>
                    <Text style={styles.signUpText}>Login here</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </WaveBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 24 },
  container: { flex: 1, width: "100%" },
  inner: { flex: 1 },
  topContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingBottom: 10,
  },
  bottomContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    marginLeft: 14,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    marginLeft: 14,
    marginTop: 4,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 54,
    marginTop: 14,
    elevation: 6,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "500",
    marginHorizontal: 8,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 10,
    marginLeft: 6,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginTop: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
    //borderWidth:1
  },
  footerText: { color: Colors.primaryGreen, fontWeight: "500", fontSize: 16 },
  signUpText: {
    color: Colors.successGreen,
    fontWeight: "700",
    fontSize: 17,
    marginLeft: 6,
  },
});
