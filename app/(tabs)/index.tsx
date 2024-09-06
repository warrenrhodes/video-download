import { Heading } from "@/components/Heading";
import { Hero } from "@/components/Hero";
import { Spacing } from "@/components/Spacing";
import { Title } from "@/components/Title";
import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 flex-col gap-3 py-3 bg-white p-3">
      <Heading />
      <View className="flex-1 flex-col justify-center">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Title>Facebook and YouTube Video Downloader</Title>
          <Spacing size="sm" />
          <Hero />
          <Spacing size="sm" />
          <View className="w-full flex flex-row overflow-hidden ">
            <StepItem
              number="1"
              text="Copy the video URL you want to download"
            />
            <StepItem number="2" text="Paste URL in the input box above" />
            <StepItem number="3" text="Click download and wait for the magic" />
          </View>
          <Spacing size="sm" />
        </ScrollView>
      </View>
    </View>
  );
}

const StepItem = ({ number, text }: { number: string; text: string }) => (
  <View className=" bg-gray-800 rounded-xl p-4 mr-4 flex-1">
    <Text className="text-white font-bold text-2xl">0{number}</Text>
    <Text className="text-white/80 text-[10px]">{text}</Text>
  </View>
);
