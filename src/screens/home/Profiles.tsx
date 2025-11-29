import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfilesScreen from "./profiles/ProfilesScreen";

const Stack = createNativeStackNavigator();

const ProfilesStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, statusBarStyle: "dark" }}
    >
      <Stack.Screen name="ProfilesScreen" component={ProfilesScreen} />
      {/* Add other settings screens */}
    </Stack.Navigator>
  );
};
export default ProfilesStack;
