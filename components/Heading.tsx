import { Text, View } from "react-native";

export const Heading = () => {
  return (
    <View className="flex-row justify-between items-center mb-6">
      <Text className="text-2xl font-bold">Downloader</Text>
      <Text className="text-red-500">Login</Text>
    </View>
  );
};
