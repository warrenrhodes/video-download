import { useState } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Spacing } from "./Spacing";
import { MediaDownloadBox } from "./MediaDownloadBox";
import { Title } from "./Title";
import { SocialIcon } from "@rneui/themed";
import { Loading } from "./Loading";

export const Hero = () => {
  const [inputText, setInputText] = useState("");
  const [isUrlLoading, setIsUrlLoading] = useState(false);

  const fetchCopiedText = async () => {
    const text = await Clipboard.getStringAsync();
    setInputText(text);
    setIsUrlLoading(true);
  };

  return (
    <View className="items-center w-full h-auto">
      <View className="relative w-full flex-col items-center">
        <ImageBackground
          source={require("@/assets/images/vector-1.png")}
          resizeMode="contain"
          className="w-full rounded-3xl z-0 overflow-hidden pb-4"
        >
          <View className="flex flex-col rounded-[40px] items-center p-6 bg-primary/10 w-full h-auto">
            <Image
              source={require("@/assets/images/vector-2.png")}
              style={{ alignSelf: "center" }}
              className="mb-4 mt-9"
            />
            <Title className="!text-foreground/80 text-2xl">Online Video</Title>
            <Title className="text-4xl mb-1 !text-foreground/90">
              Downloader
            </Title>
            <View className="flex-row items-center">
              <SocialIcon type={"facebook"} iconSize={15} />
              <SocialIcon type={"youtube"} iconSize={15} />
              <View className="rounded-full ml-2 bg-black size-9">
                <Image
                  source={require("@/assets/images/tiktok-icon.png")}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
            </View>
            <Title className="!text-foreground text-md text-center mb-4">
              Do Not Look Below! Explore Our
              <Text className="text-rose-700"> VideoMax </Text> Video
              Downloader, A Free Solution To Quickly Download Videos Or Music
              With Just One Click!
            </Title>

            <View className="flex-row items-center mb-7 gap-2 max-w-44">
              <View className="flex-1 h-1 bg-white/20 rounded-full" />
              <View className="flex-1 h-1 bg-primary rounded-full" />
              <View className="flex-1 h-1 bg-white/20 rounded-full" />
            </View>
            <View className="bg-white rounded-full p-1  w-full self-end overflow-hidden">
              <View className="bg-neutral-100 rounded-full p-3  w-full flex flex-row overflow-hidden h-12 items-center">
                <View>
                  <Loading size={30} />
                </View>
                <TextInput
                  className=" text-black rounded-full w-full"
                  placeholder=" Parse The Video Link Here..."
                  placeholderTextColor="#9CA3AF"
                  cursorColor={"#9CA3AF"}
                  keyboardType="url"
                  returnKeyType="search"
                  readOnly
                  style={{ fontFamily: "NerkoOne" }}
                >
                  <Text style={{ fontFamily: "NerkoOne" }}>{inputText}</Text>
                </TextInput>
              </View>
            </View>
            <Spacing size={"sm"} />
          </View>
        </ImageBackground>

        <TouchableOpacity
          className="bg-primary rounded-full py-3 max-sm:w-1/2 items-center z-10  absolute -bottom-1 w-sm"
          onPress={fetchCopiedText}
        >
          <Title className="!text-white text-3xl">Parse</Title>
        </TouchableOpacity>
      </View>
      <MediaDownloadBox
        isLoaded={isUrlLoading}
        url={inputText}
        callback={(value) => {
          setIsUrlLoading(value), setInputText("");
        }}
      />
    </View>
  );
};
