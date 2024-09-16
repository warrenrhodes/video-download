import {
  downloadAndSaveData,
  estimateDownloadSize,
  fetchYouTubeVideoByUrl,
  isExpired,
  SocialMediaType,
  YouTubeVideoFormat,
  YTRequestFormat,
} from "@/lib/download_request";
import { Button, Overlay } from "@rneui/themed";
import { useCallback, useEffect, useState } from "react";
import { View, Animated, Image } from "react-native";
import { Loading } from "./Loading";
import { displayMessage } from "./Toast";
import * as FileSystem from "expo-file-system";
import { cn } from "@/lib/utils";
import { useDatabase } from "./hooks/DatabaseProvider";
import { Title } from "./Title";

export const MediaDownloadBox = (props: {
  isLoaded: boolean;
  url: string;
  callback: (isLoaded: boolean) => void;
}) => {
  const { saveData } = useDatabase();
  const [formats, setFormats] = useState<YTRequestFormat>();
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState<{
    state: boolean;
    itag: number;
  }>();

  function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const clearData = (closeBox: boolean) => {
    setProgress(0);
    setIsDownloading(undefined);
    if (closeBox) {
      props.callback(false);
      setFormats(undefined);
    }
  };

  const downloadVideo = async (format: YouTubeVideoFormat, title: string) => {
    try {
      setProgress(0);
      setIsDownloading({
        state: true,
        itag: format.itag,
      });
      const isVideo = format.audioCodec && format.videoCodec;
      const number = getRandomNumber(0, 500);
      const fileName = `${formats?.socialMedia}_${
        isVideo ? number + "video" : number + "audio"
      }.${isVideo ? format.container : "mp3"}`;
      const videoPath = FileSystem.documentDirectory + fileName;
      const url = new URL(format.url);
      const expired = url.searchParams.get("expire");
      if (expired && isExpired(Number(expired) * 1000)) {
        displayMessage({
          message: "Video URL expired",
          messageType: "error",
        });
        clearData(true);
        return;
      }

      const downloadedResult = await downloadAndSaveData(
        videoPath,
        format.url,
        (progressValue) => setProgress(progressValue)
      );

      if (downloadedResult.errorMessage) {
        displayMessage({
          message: downloadedResult.errorMessage,
          messageType: "error",
        });
        clearData(true);
        return;
      }
      displayMessage({
        message:
          "Video downloaded successfully. Follow the video download on history tab",
        messageType: "success",
      });
      await saveData<{
        title: string;
        displayName: string;
      }>({
        id: fileName,
        data: {
          title: fileName,
          displayName: title,
        },
      });
      clearData(false);
    } catch (error) {
      console.error("Error downloading video:", error);
      clearData(true);
    }
  };

  const _fetchYouTubeVideoByUrl = useCallback(async (url: string) => {
    try {
      const videoData = await fetchYouTubeVideoByUrl(url);
      if (videoData.errorMessage) {
        displayMessage({
          message: videoData.errorMessage,
          messageType: "error",
        });
        clearData(true);
        return;
      }
      setFormats(videoData.data);
    } catch (error) {
      console.error("Error fetching YouTube video data:", error);
      clearData(true);
    }
  }, []);

  useEffect(() => {
    console.log("props.isLoaded", props.isLoaded);
    if (props.isLoaded) {
      _fetchYouTubeVideoByUrl(props.url);
    }
  }, [props.isLoaded, props.url]);

  /**
   * Resets the component state and calls the callback function passed as a prop.
   *
   * This function is called when the user clicks the close button on the modal.
   */
  const handleClose = (): void => {
    setProgress(0);
    setIsDownloading(undefined);
    setFormats(undefined);
    props.callback(false);
  };

  return (
    <>
      <Overlay
        transparent
        isVisible={props.isLoaded}
        animationType="fade"
        backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5  )" }}
        overlayStyle={{
          backgroundColor: "transparent",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "transparent",
          height: "100%",
          width: "100%",
        }}
      >
        {props.isLoaded && !formats ? (
          <View
            className="flex-1 justify-center items-center"
            style={{ height: "20%", width: "100%" }}
          >
            <Loading />
          </View>
        ) : (
          formats && (
            <View className="justify-center items-center bg-card border-2 border-white h-auto w-full rounded-2xl max-w-[450px] overflow-hidden">
              <View className="w-full flex justify-center items-center">
                {formats.socialMedia === SocialMediaType.YOUTUBE ? (
                  <Animated.Image
                    source={{ uri: formats.thumbnail }}
                    style={[
                      {
                        width: "70%",
                        height: 200,
                      },
                    ]}
                    resizeMode="contain"
                  />
                ) : (
                  <View
                    style={[
                      {
                        width: "70%",
                        height: 200,
                        backgroundColor: "#f4f4f4",
                      },
                    ]}
                  >
                    <SocialMediaImage socialMediaType={formats.socialMedia} />
                  </View>
                )}
                <Title className="text-2xl mb-3 p-3 !text-foreground">
                  {formats.title}
                </Title>
              </View>

              <View className="flex-row justify-center items-start flex-wrap gap-3 w-auto">
                {formats.formats.video.length > 0 && (
                  <View className="flex-1 flex-col items-center justify-start w-auto">
                    <Title className="text-lg  mb-3 !text-foreground">
                      Video Format
                    </Title>
                    {formats.formats.video.map((e) => {
                      const size =
                        e.contentLength &&
                        estimateDownloadSize(Number(e.contentLength));
                      return (
                        <View key={e.itag}>
                          <Button
                            title={`${e.qualityLabel} ${
                              size ? `(${size}Mb)` : ""
                            }`}
                            onPress={() => downloadVideo(e, formats.title)}
                            buttonStyle={{
                              borderColor: "rgba(78, 116, 289, 1)",
                            }}
                            type="outline"
                            raised
                            titleStyle={{ color: "rgba(78, 116, 289, 1)" }}
                            containerStyle={{
                              width: 150,
                            }}
                            loading={
                              isDownloading?.state &&
                              isDownloading?.itag === e.itag
                            }
                            disabled={
                              isDownloading?.state &&
                              isDownloading?.itag !== e.itag
                            }
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
                {formats.formats.audio.length > 0 && (
                  <View className="flex-1 flex-col items-center w-auto">
                    <Title className="text-lg mb-3 !text-foreground">
                      Audio Format
                    </Title>
                    {formats.formats.audio.slice(0, 3).map((e) => {
                      const size =
                        e.contentLength &&
                        estimateDownloadSize(Number(e.contentLength));
                      return (
                        <View key={e.itag} className="mb-3">
                          <Button
                            title={`${
                              e.audioCodec == "opus" ? "Opus" : "M4A"
                            } ${size && `(${size}Mb)`}`}
                            onPress={() => downloadVideo(e, formats.title)}
                            buttonStyle={{
                              borderColor: "rgba(78, 116, 289, 1)",
                            }}
                            type="outline"
                            raised
                            titleStyle={{ color: "rgba(78, 116, 289, 1)" }}
                            containerStyle={{
                              width: 150,
                            }}
                            loading={
                              isDownloading?.state &&
                              isDownloading?.itag === e.itag
                            }
                            disabled={
                              isDownloading?.state &&
                              isDownloading?.itag !== e.itag
                            }
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              <View
                className={cn(
                  {
                    "p-3": isDownloading?.state === true && progress > 0,
                  },
                  "w-full"
                )}
              >
                {isDownloading?.state === true && progress > 0 && (
                  <View className="relative w-full h-8 bg-rose-700/35 justify-center">
                    <View
                      className="h-full bg-rose-700 absolute inset-0"
                      style={{ width: `${progress * 100}%` }}
                    />
                    <Title className="!text-foreground text-center">
                      {(progress * 100).toFixed(2)}%
                    </Title>
                  </View>
                )}
              </View>

              <View className="flex-row items-end justify-end w-full p-3">
                <Button
                  containerStyle={{
                    width: "auto",
                  }}
                  disabled={isDownloading?.state === true}
                  title="Close"
                  type="clear"
                  titleStyle={{ color: "rgba(78, 116, 289, 1)" }}
                  onPress={handleClose}
                />
              </View>
            </View>
          )
        )}
      </Overlay>
    </>
  );
};

const SocialMediaImage = ({
  socialMediaType,
}: {
  socialMediaType: SocialMediaType;
}) => {
  switch (socialMediaType) {
    case SocialMediaType.FACEBOOK:
      return (
        <Image
          source={require("@/assets/images/facebook.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      );
    case SocialMediaType.TIKTOK:
      return (
        <Image
          source={require("@/assets/images/tiktok.jpg")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      );
    default:
      return (
        <Image
          source={require("@/assets/images/video.jpg")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      );
  }
};
function openAppSettings() {
  throw new Error("Function not implemented.");
}
