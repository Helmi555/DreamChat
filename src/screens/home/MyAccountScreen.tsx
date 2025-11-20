import * as React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsMainScreen from "./settings/SettingsMainScreen";
import EditProfileScreen from "./settings/EditProfileScreen";

const Stack = createNativeStackNavigator();



const MyAccountScreen: React.FC = () => {
return (
  <Stack.Navigator screenOptions={{ headerShown: false, statusBarStyle: 'dark' }} >
    <Stack.Screen name="SettingsMain" component={SettingsMainScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    {/* Add other settings screens */}
  </Stack.Navigator>
);
};
export default MyAccountScreen;
