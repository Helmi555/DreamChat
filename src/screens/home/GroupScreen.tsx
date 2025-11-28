import * as React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsMainScreen from "./settings/SettingsMainScreen";
import EditProfileScreen from "./settings/EditProfileScreen";
import StayTunedScreen from "./settings/StayTunedScreen";
import MessagesScreen from "./messages/MessagesScreen";
import GroupScreen from "./messages/GroupScreen";

const Stack = createNativeStackNavigator();



const MyAccountScreen: React.FC = () => {
return (
  <Stack.Navigator screenOptions={{ headerShown: false, statusBarStyle: 'dark' }} >
    <Stack.Screen name="ChatsScreen" component={GroupScreen} />
    <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
    {/* Add other settings screens */}
  </Stack.Navigator>
);
};
export default MyAccountScreen;
