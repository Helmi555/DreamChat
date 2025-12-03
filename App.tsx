import { View, Text, LogBox } from "react-native";
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/screens/home/Home";
import LoadingScreen from "screens/auth/LoadingScreen";
import { UserProvider } from "context/UserContext";
import { supabase } from "configs/supabase";

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

const App = () => {
  console.log("App component loaded");

  // Add this test in your app
  const testSupabase = async () => {
    try {
      console.log("Testing Supabase connection...");
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      console.log("✅ Supabase connection OK:", data);
    } catch (error) {
      console.log("❌ Supabase connection failed:", error);
    }
  };

  testSupabase();

  return (
    <NavigationContainer>
      <UserProvider>
        <Stack.Navigator
          initialRouteName="Loading"
          screenOptions={{ headerShown: false, statusBarStyle: "light" }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Loading" component={LoadingScreen} />
        </Stack.Navigator>
      </UserProvider>
    </NavigationContainer>
  );
};

export default App;
