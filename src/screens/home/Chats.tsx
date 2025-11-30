import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ConversationScreen from "./chats/ConversationScreen";
import ChatsScreen from "./chats/ChatsScreen";
// import ChatsScreen from "./chats/ChatScreen";

const Stack = createNativeStackNavigator();

const Chats: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, statusBarStyle: "dark" }}
    >
      <Stack.Screen name="ChatsScreen" component={ChatsScreen} />
      <Stack.Screen name="ConversationScreen" component={ConversationScreen} />
    </Stack.Navigator>
  );
};
export default Chats;
