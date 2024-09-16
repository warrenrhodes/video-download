import { Text, View } from "react-native";
import { Title } from "./Title";
import { MoonSvg } from "./icons/Moon";
import { SunSVG } from "./icons/Sun";
import { useThemeMode } from "@rneui/themed";

const VideoIcon = () => <Text className="text-md">🎥</Text>;
const LanguageIcon = () => <Text className="text-sm">🌐</Text>;
export const Heading = () => {
  const { mode, setMode } = useThemeMode();
  console.log("mode", mode);
  return (
    <View className="flex-row justify-between items-center p-4">
      <View className="flex gap-1 flex-row items-center justify-center">
        <VideoIcon />
        <Title className="flex-2 text-2xl">
          Video<Text className="text-2xl text-gray-700/80">Max</Text>
        </Title>
      </View>
      {mode === "light" ? (
        <MoonSvg onPress={() => setMode("dark")} size={24} color={"white"} />
      ) : (
        <SunSVG onPress={() => setMode("light")} size={24} color={"black"} />
      )}
      {/* <View className="flex-row items-center bg-gray-800 rounded-full px-3 py-1">
        <LanguageIcon />
        <Text className="text-white ml-1 mr-2">ENG</Text>
        <Text className="text-white">▼</Text>
      </View> */}
    </View>
  );
};
