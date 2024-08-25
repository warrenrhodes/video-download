import {
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const VideoIcon = () => <Text className="text-2xl">🎥</Text>;
const LanguageIcon = () => <Text className="text-sm">🌐</Text>;

export const Hero = () => {
  return (
    <View className="overflow-hidden p-3 items-center">
      <StatusBar barStyle="light-content" />

      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-row items-center">
          <VideoIcon />
          <Text className="text-xl font-bold ml-2">VideoMax</Text>
        </View>
        <View className="flex-row items-center bg-gray-800 rounded-full px-3 py-1">
          <LanguageIcon />
          <Text className="text-white ml-1 mr-2">ENG</Text>
          <Text className="text-white">▼</Text>
        </View>
      </View>

      <View className="flex relative items-center">
        <View className="absolute -z-10 w-full h-full items-center justify-center">
          <Image
            source={require("@/assets/images/favicon.png")}
            style={{ alignSelf: "center" }}
          />
        </View>
        <View className="flex-col p-6 items-center bg-neutral-300/50 relative rounded-3xl blur-[1px]">
          <Text className="text-red-500 text-4xl font-bold mb-2 mt-8">
            ~~~~~~
          </Text>
          <Text className="text-gray-500 text-3xl font-light">
            Online Video
          </Text>
          <Text className="text-gray-800 text-4xl font-extrabold mb-2">
            Downloader
          </Text>

          <Text className="text-gray-700 text-sm  text-center mb-4">
            Do Not Look Below! Explore Our VideoMAX Video Downloader, A Free
            Solution To Quickly Download Videos Or Music With Just One Click!
          </Text>
          <View className="bg-white rounded-full p-1 mb-8">
            <TextInput
              className="bg-neutral-100 text-white rounded-full p-3"
              placeholder="🔗 Insert Youtube Video Link Here..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity className="bg-red-500 rounded-full py-3 items-center w-full absolute -bottom-5">
            <Text className="text-white font-bold text-lg">Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
// export const Hero = () => {
//   return (
//     <View className="bg-white rounded-lg p-4 mb-6">
//       <Text className="text-xl font-semibold mb-4">Video Downloader</Text>
//       <TextInput
//         className="border border-gray-300 rounded-full px-4 py-2 mb-4"
//         placeholder="Enter video URL here"
//       />
//       <TouchableOpacity className="bg-red-500 rounded-full py-2">
//         <Text className="text-white text-center font-semibold">Download</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };
