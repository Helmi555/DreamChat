import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupsScreen from "./groups/GroupsScreen";
import CreateGroupScreen from "./groups/CreateGroupScreen";

const Stack = createNativeStackNavigator();

const GroupsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, statusBarStyle: "dark" }}
    >
      <Stack.Screen name="GroupsScreen" component={GroupsScreen} />
      <Stack.Screen name="CreateGroupScreen" component={CreateGroupScreen} />
    </Stack.Navigator>
  );
};
export default GroupsStack;
