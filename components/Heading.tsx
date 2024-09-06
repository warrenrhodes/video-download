import { Text, View } from "react-native";

const VideoIcon = () => <Text className="text-2xl">🎥</Text>;
const LanguageIcon = () => <Text className="text-sm">🌐</Text>;
export const Heading = () => {
  return (
    <View className="flex-row justify-between items-center p-4">
      <View className="flex gap-3 flex-row items-center">
        <VideoIcon />
        <Text className="flex-2 text-xl font-extrabold">
          Video<Text className="text-xl font-medium">Max</Text>
        </Text>
      </View>

      <View className="flex-row items-center bg-gray-800 rounded-full px-3 py-1">
        <LanguageIcon />
        <Text className="text-white ml-1 mr-2">ENG</Text>
        <Text className="text-white">▼</Text>
      </View>
    </View>
  );
};
