import { Heading } from "@/components/Heading";
import { Hero } from "@/components/Hero";
import { PermissionsAndroid, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Cool Photo App Camera Permission",
          message:
            "Cool Photo App needs access to your camera " +
            "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-900 h-full">
      <Heading />
      <Hero />

      {/* <View>
        <StepItem number="01" text="Copy the video URL you want to download" />
        <StepItem number="02" text="Paste URL in the input box above" />
        <StepItem number="03" text="Click download and wait for the magic" />
      </View> */}
    </SafeAreaView>
  );
}

const FeatureItem = ({ title, icon }: { title: string; icon: string }) => (
  <View className="items-center">
    <Text className="text-3xl mb-2">{icon}</Text>
    <Text className="text-sm">{title}</Text>
  </View>
);

const StepItem = ({ number, text }: { number: string; text: string }) => (
  <View className="flex-row items-center mb-4">
    <View className="bg-red-500 w-8 h-8 rounded-full items-center justify-center mr-4">
      <Text className="text-white font-bold">{number}</Text>
    </View>
    <Text className="flex-1">{text}</Text>
  </View>
);
