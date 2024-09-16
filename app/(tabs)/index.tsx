import { Heading } from "@/components/Heading";
import { Hero } from "@/components/Hero";
import { Spacing } from "@/components/Spacing";
import { Title } from "@/components/Title";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 flex-col gap-3 py-3 bg-background p-3">
      <Heading />
      <View className="flex-1 flex-col justify-center">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Hero />
          <Spacing size="sm" />
          <View className="w-full flex flex-row overflow-hidden gap-3">
            <StepItem
              number="1"
              text="Copy the video URL you want to download."
            />
            <StepItem number="2" text="Paste URL in the input box above." />
            <StepItem
              number="3"
              text="Click download and wait for the magic."
            />
          </View>
          <Spacing size="sm" />
        </ScrollView>
      </View>
    </View>
  );
}

const StepItem = ({ number, text }: { number: string; text: string }) => (
  <View className=" bg-primary/10 rounded-xl p-2 flex-1">
    <Title className="!text-foreground text-3xl">0{number}</Title>
    <Title className="!text-foreground text-[13px]">{text}</Title>
  </View>
);
