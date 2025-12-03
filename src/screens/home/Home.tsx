import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { StyleSheet } from "react-native";
import SettingsStack from "./Settings";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../colors";
import Chats from "./Chats";
import ProfilesStack from "./Profiles";
import GroupsStack from "./Groups";

const Tab = createMaterialBottomTabNavigator();

export type HomeTabParamList = {
  List: undefined;
  Groups: undefined;
  Settings: undefined;
};

const Home: React.FC = () => {
  return (
    <Tab.Navigator
      shifting={true}
      initialRouteName="Chats"
      
      barStyle={{
        backgroundColor: Colors.backgroundLight,
        elevation:4
      }}
      activeColor={Colors.primaryGreen}
      inactiveColor={Colors.textPrimary}
      activeIndicatorStyle={{ backgroundColor: Colors.badgeGreen,width:46,height:40,borderRadius:24 }}
      
    >
      <Tab.Screen
        name="Chats"
        component={Chats}
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbox-ellipses" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profiles"
        component={ProfilesStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-circle" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />

    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({});

export default Home;
