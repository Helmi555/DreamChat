import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupScreen from "./messages/GroupScreen";
import MessagesScreen from "./messages/MessagesScreen";
import ChatsScreen from "./chats/ChatScreen";

const Stack = createNativeStackNavigator();

const Chats: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, statusBarStyle: "dark" }}
    >
      <Stack.Screen name="ChatsScreen" component={ChatsScreen} />
      <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
    </Stack.Navigator>
  );
};
export default Chats;
