import { Text, View } from "react-native";
import { Title } from "./Title";
import { MoonSvg } from "./icons/Moon";
import { SunSVG } from "./icons/Sun";
import { Image } from "expo-image";
import { useThemeMode } from "@rneui/themed";

const VideoIcon = () => <Text className="text-md">🎥</Text>;
export const Heading = () => {
  const { mode, setMode } = useThemeMode();
  return (
    <View className="flex-row justify-between items-center p-4">
      <View className="flex gap-2 flex-row items-center justify-center">
        <Image
          source={require("@/assets/images/favicon.png")}
          style={{ width: 25, height: 25 }}
        />
        <Title className="flex-2 text-2xl">
          Video<Text className="text-2xl text-gray-700/80">Max</Text>
        </Title>
      </View>
      {mode === "light" ? (
        <MoonSvg onPress={() => setMode("dark")} size={24} color={"white"} />
      ) : (
        <SunSVG onPress={() => setMode("light")} size={24} color={"black"} />
      )}
    </View>
  );
};
