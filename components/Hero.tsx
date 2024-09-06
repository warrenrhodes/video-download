import { FbVideoData, fetchFacebookUrl } from "@/lib/download_request";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { useRef, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TouchableMedia } from "./ImageManager";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Button } from "@rneui/themed";
import * as Clipboard from "expo-clipboard";
import { Loading } from "./Loading";
import { Spacing } from "./Spacing";
import * as FileSystem from "expo-file-system";
import { VideoMaxDirPath } from "@/lib/constants";
import { displayMessage } from "./Toast";
import { YouTubeDownloadBox } from "./YoutubeDownloadBox";
export const Hero = () => {
  const [video, setVideoMedias] = useState<FbVideoData>();
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [isDownloading, setIsDownloading] = useState<{
    state: boolean;
    url: string;
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<Video>(null);
  const [inputText, setInputText] = useState("");
  const [isUrlLoading, setIsUrlLoading] = useState(false);

  const fetchCopiedText = async () => {
    const text = await Clipboard.getStringAsync();
    setInputText(text);
    if (text.includes("facebook")) {
      fetchFacebookVideoByUrl(text);
    }
    if (text.includes("youtu.be") || text.includes("youtube")) {
      setIsUrlLoading(true);
    }
  };

  const fetchFacebookVideoByUrl = async (url: string) => {
    setIsUrlLoading(true);

    const result = await fetchFacebookUrl(url);
    if (result.success) {
      setVideoMedias(result.success);
      setIsUrlLoading(false);
      return;
    }
    setIsUrlLoading(false);
    const message = result.errorMessage;
    displayMessage({
      message: message ?? "Something went wrong. Please try again",
      messageType: "error",
    });
  };

  const downloadFbVideo = async (url: string, fileName: string) => {
    const newFileName = "Fb-" + fileName + `${new Date().getTime()}` + ".mp4";
    setIsDownloading(() => ({ state: true, url }));
    setProgress(0);
    const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      setProgress(() => progress * 100);
    };
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      VideoMaxDirPath + newFileName,
      {},
      callback
    );
    try {
      const result = await downloadResumable.downloadAsync();
      console.log("Finished downloading to ", result?.uri);
      console.log("Success", "Video downloaded successfully");
      displayMessage({
        message: "Video downloaded successfully",
        messageType: "success",
      });
      setIsDownloading(null);
      setProgress(0);

      return;
    } catch (e) {
      console.error("Download error:", e);
      console.error("Error", "Download failed");
      displayMessage({
        message: "Download failed. Please try again",
        messageType: "error",
      });
      setIsDownloading(null);
      setProgress(0);
    }
  };

  return (
    <View className="items-center w-full h-auto">
      <View className="relative w-full flex-col items-center">
        <ImageBackground
          source={require("@/assets/images/vector-1.png")}
          resizeMode="contain"
          className="w-full rounded-3xl z-0 overflow-hidden pb-4"
        >
          <View className="flex flex-col rounded-[40px] items-center p-6 bg-neutral-300/80 object-contain w-full h-auto">
            <Image
              source={require("@/assets/images/vector-2.png")}
              style={{ alignSelf: "center" }}
              className="mb-4 mt-9"
            />
            <Text className="text-gray-500 text-2xl font-semibold">
              Online Video
            </Text>
            <Text className="text-gray-600 text-4xl font-extrabold mb-4">
              Downloader
            </Text>
            <Text className="text-black/50 text-sm font-semibold  text-center mb-4">
              Do Not Look Below! Explore Our{" "}
              <Text className="text-pink-800">VideoMax</Text> Video Downloader,
              A Free Solution To Quickly Download Videos Or Music With Just One
              Click!
            </Text>

            <View className="flex-row items-center mb-7 gap-2 max-w-44">
              <View className="flex-1 h-1 bg-neutral-300/50 rounded-full" />
              <View className="flex-1 h-1 bg-rose-800/50 rounded-full" />
              <View className="flex-1 h-1 bg-neutral-300/50 rounded-full" />
            </View>
            <View className="bg-white rounded-full p-1  w-full self-end ">
              <TextInput
                className="bg-neutral-100 text-black rounded-full p-3 w-full"
                placeholder="🔗 Parse The Video Link Here..."
                placeholderTextColor="#9CA3AF"
                cursorColor={"#9CA3AF"}
                keyboardType="url"
                returnKeyType="search"
                readOnly
              >
                <Text>{inputText}</Text>
              </TextInput>
            </View>
            {video && !isUrlLoading && (
              <View className="relative w-full mt-3 rounded-xl overflow-hidden  bg-black flex-row h-[150px]">
                {isDownloading?.state === true && (
                  <View
                    className="absolute w-full h-3 bg-white"
                    style={{ zIndex: 1 }}
                  >
                    <View
                      className="h-full bg-rose-700"
                      style={{ width: `${progress}%` }}
                    />
                  </View>
                )}
                <View className="relative flex-1">
                  <Video
                    ref={videoRef}
                    source={{
                      uri: video.urls[0].url,
                    }}
                    style={{
                      width: 150,
                      height: 150,
                      position: "relative",
                    }}
                    resizeMode={ResizeMode.COVER}
                    onPlaybackStatusUpdate={(status) => setStatus(() => status)}
                  />
                  <View className="flex-1 absolute inset-0 h-screen w-full">
                    <TouchableMedia
                      uri={video.urls[0].url}
                      mediaType={"videos"}
                    />
                  </View>
                  <Pressable
                    className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center"
                    onPress={() =>
                      status?.isLoaded === true && status?.isPlaying
                        ? videoRef.current?.pauseAsync()
                        : videoRef.current?.playAsync()
                    }
                  >
                    {status?.isLoaded === true && status?.isPlaying ? (
                      <AntDesign name="pausecircleo" size={30} color="white" />
                    ) : (
                      <AntDesign name="playcircleo" size={30} color="white" />
                    )}
                  </Pressable>
                </View>
                <View className="flex-col items-center justify-center flex-1 gap-3 p-3">
                  {video.urls.map((url) => (
                    <Button
                      title={url.quality}
                      key={url.url}
                      disabled={isDownloading?.state}
                      disabledStyle={{
                        backgroundColor: "rgba(190, 18, 60, 0)",
                      }}
                      disabledTitleStyle={{ color: "white" }}
                      onPress={() => downloadFbVideo(url.url, video.fileName)}
                      loading={isDownloading?.url === url.url}
                      titleStyle={{
                        fontWeight: "700",
                        fontSize: 12,
                        textDecorationStyle: "solid",
                        textDecorationLine: "underline",
                      }}
                      buttonStyle={{
                        backgroundColor: "rgba(190, 18, 60, 0)",
                        borderRadius: 50,
                        height: 40,
                        padding: 0,
                        width: "100%",
                      }}
                      containerStyle={{
                        width: "100%",
                      }}
                    />
                  ))}
                </View>
              </View>
            )}
            {isUrlLoading && <Loading size={35} />}

            <Spacing size={"sm"} />
          </View>
        </ImageBackground>

        <TouchableOpacity
          className="bg-rose-700 rounded-full py-3 max-sm:w-1/2 items-center z-10  absolute -bottom-1 w-sm"
          onPress={fetchCopiedText}
        >
          <Text className="text-white font-bold text-lg">Parse</Text>
        </TouchableOpacity>
      </View>
      <YouTubeDownloadBox
        isLoaded={isUrlLoading}
        url={inputText}
        callback={setIsUrlLoading}
      />
    </View>
  );
};
