import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { StyleSheet } from "react-native";
import GroupScreen from "./GroupScreen";
import MyAccountScreen from "./MyAccountScreen";
import ListScreen from "./ListScreen";

const Tab = createMaterialBottomTabNavigator();
const Home: React.FC = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="List" component={ListScreen} />
      <Tab.Screen name="Groups" component={GroupScreen} />
      <Tab.Screen name="MyAccount" component={MyAccountScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({});

export default Home;
