import {  useState } from "react";
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
} from "react-native";
import WaveBackground from "./components/WaveBackground";
import { Colors } from "colors";
import { Ionicons } from "@expo/vector-icons";
import GradientButton from "features/shared/components/buttons/GradientButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "config/firebase";

import AsyncStorage from "@react-native-async-storage/async-storage";

const rememberedUserKey = "rememberedUser";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const onSubmitPress = async () => {
    if (username == "" || password === "") {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      Keyboard.dismiss();
      setError("");
      await signInWithEmailAndPassword(auth, username, password);
      if (rememberMe) {
        await AsyncStorage.setItem(rememberedUserKey, username);
        console.info("user saved "+username)
      }
      navigation.replace("Home");
    } catch (error) {
      setError("Invalid email or password.");
    }
  };

  const onSignUpPress = () => navigation.navigate("Register");

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
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.titleDescription}>
                  Please login to your{" "}
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
                      name="person-outline"
                      size={22}
                      color={Colors.textThirdly}
                    />
                    <TextInput
                      style={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="Enter email"
                      placeholderTextColor={Colors.textThirdly}
                      value={username}
                      onChangeText={(username) => {
                        setError("");
                        setUsername(username);
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

                  {error ? <Text style={styles.errorText}>{error}</Text> : null}

                  {/**make a radio button for remember me */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 12,
                      paddingHorizontal: 4,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 0,
                      }}
                      onPress={() => setRememberMe(!rememberMe)}
                    >
                      <View style={styles.radioCircle}>
                        {rememberMe && <View style={styles.selectedRb} />}
                      </View>
                      <Text style={styles.label}>Remember Me</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.forgotPasswordText}>
                        Forgot password?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.buttonRow}>
                    <GradientButton
                      text="Login"
                      iconName="keyboard-arrow-right"
                      onPress={onSubmitPress}
                      width="40%"
                      height={46}
                      loading={false}
                      iconSize={26}
                    />
                  </View>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account?</Text>
                  <TouchableOpacity onPress={onSignUpPress} activeOpacity={0.8}>
                    <Text style={styles.signUpText}>Sign up here</Text>
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
    //borderWidth:1,
    //borderColor:"black"
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
    //borderWidth:1,
    //borderColor:"red"
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
  forgotPasswordText: {
    alignSelf: "flex-start",
    marginLeft: 14,
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginTop: 22,
  },
  button: {
    flexDirection: "row",
    height: 46,
    width: "40%",
    borderRadius: 22,
    backgroundColor: Colors.badgeGreen,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: Colors.badgeGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
    //borderWidth:1,
    //borderColor:"blue"
  },
  footerText: { color: Colors.primaryGreen, fontWeight: "500", fontSize: 16 },
  signUpText: {
    color: Colors.successGreen,
    fontWeight: "700",
    fontSize: 17,
    marginLeft: 6,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 8,
    alignSelf: "flex-start",
    fontWeight: "600",
  },
  radioCircle: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2e7d32",
    justifyContent: "center",
    marginRight: 8,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2e7d32",
  },
  label: {
    fontSize: 16,
    color: "#333333ed",
    fontWeight: "500",
  },
});
