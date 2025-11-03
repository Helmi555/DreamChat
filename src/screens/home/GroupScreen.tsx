import React from "react";
import { View, Text } from "react-native";
import { Colors } from "../../colors";


const GroupScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center",backgroundColor:Colors.backgroundLight }}>
      <Text>GroupScreen</Text>
    </View>
  );
};

export default GroupScreen;
