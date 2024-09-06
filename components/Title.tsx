import { PropsWithChildren } from "react";
import { View, Text } from "react-native";

export const Title = (props: PropsWithChildren) => {
  return (
    <View className="flex items-center">
      <Text className="text-md font-semibold text-gray-700">
        {props.children}
      </Text>
    </View>
  );
};
