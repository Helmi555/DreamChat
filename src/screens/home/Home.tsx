import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { StyleSheet } from "react-native";
import GroupScreen from "./GroupScreen";
import MyAccountScreen from "./MyAccountScreen";
import ListScreen from "./ListScreen";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../colors";

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
      initialRouteName="Settings"
      
      barStyle={{
        backgroundColor: Colors.backgroundLight,
        elevation:4
      }}
      activeColor={Colors.primaryGreen}
      inactiveColor={Colors.textPrimary}
      activeIndicatorStyle={{ backgroundColor: Colors.badgeGreen,width:46,height:40,borderRadius:24 }}
      
    >
      <Tab.Screen
        name="List"
        component={ListScreen}
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbox-ellipses" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={MyAccountScreen}
        
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({});

export default Home;
