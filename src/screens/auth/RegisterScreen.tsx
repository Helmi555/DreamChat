import React from "react";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

export default function RegisterScreen() {
  const navigation: any = useNavigation();

  const onBackPress = () => {
    navigation.goBack();
  };
  const onSubmitPress = () => {};
  const onLoginPress = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/img_background.jpg")}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <StatusBar style="light" />

        <Text style={styles.title}>SignUp to WhatsHelmi</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            placeholderTextColor="rgba(255,255,255,0.6)"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="rgba(255,255,255,0.6)"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Enter confirm password"
            placeholderTextColor="rgba(255,255,255,0.6)"
            secureTextEntry
          />

          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "space-around",
              flexDirection: "row",
            }}
          >
            <TouchableOpacity activeOpacity={0.85} style={styles.button}>
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>Submit</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.button}
              onPress={onBackPress}
            >
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>Back</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 12,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "500", fontSize: 16 }}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={onLoginPress} activeOpacity={0.8}>
            <Text
              style={{
                color: "#c9b6ff",
                fontWeight: "700",
                fontSize: 17,
                marginLeft: 6,
              }}
            >
              Sign in here
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //  backgroundColor: "#071029",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 18,
    letterSpacing: 0.6,
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 14,
  },

  card: {
    width: "86%",
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "#0c1838ff",
  },

  input: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: "#fff",
    marginTop: 14,
    borderWidth: 1,
  },

  button: {
    marginTop: 18,
    width: "40%",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  buttonInner: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff6a00",
    shadowColor: "#ff6a00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },

  ghostButton: {
    marginTop: 12,
    backgroundColor: "transparent",
    borderWidth: 1,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.6,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  ghostText: {
    color: "#c9b6ff",
    fontWeight: "700",
  },
});
