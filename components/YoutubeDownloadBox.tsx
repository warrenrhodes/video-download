import {
  downloadAndSaveData,
  estimateDownloadSize,
  fetchYouTubeVideoByUrl,
  isExpired,
  YouTubeVideoFormat,
  YTRequestFormat,
} from "@/lib/download_request";
import { Button, Overlay } from "@rneui/themed";
import { useCallback, useEffect, useState } from "react";
import { View, Animated, Text } from "react-native";
import { Loading } from "./Loading";
import { displayMessage } from "./Toast";
import * as FileSystem from "expo-file-system";
import { cn } from "@/lib/utils";

export const YouTubeDownloadBox = (props: {
  isLoaded: boolean;
  url: string;
  callback: (isLoaded: boolean) => void;
}) => {
  const [formats, setFormats] = useState<YTRequestFormat>();
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState<{
    state: boolean;
    itag: number;
  }>();

  function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const clearData = (closeBox = true) => {
    setFormats(undefined);
    setProgress(0);
    setIsDownloading(undefined);
    closeBox && props.callback(false);
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
      const videoPath =
        FileSystem.documentDirectory +
        `${title}_${isVideo ? number + "video" : number + "audio"}.${
          isVideo ? format.container : "mp3"
        }`;
      const url = new URL(format.url);
      const expired = url.searchParams.get("expire");
      if (expired && isExpired(Number(expired) * 1000)) {
        displayMessage({
          message: "Video URL expired",
          messageType: "error",
        });
        clearData();
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
        clearData();
        return;
      }
      displayMessage({
        message:
          "Video downloaded successfully. Follow the video download on history tab",
        messageType: "success",
      });
      clearData(false);
    } catch (error) {
      console.error("Error downloading video:", error);
      clearData();
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
        clearData();
        return;
      }
      setFormats(videoData.data);
    } catch (error) {
      console.error("Error fetching YouTube video data:", error);
      clearData();
    }
  }, []);

  useEffect(() => {
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
            <View className="justify-center items-center bg-white h-auto w-full rounded-xl max-w-[450px] overflow-hidden">
              <View className="w-full flex justify-center items-center">
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
                <Text className="text-lg font-bold mb-3">{formats.title}</Text>
              </View>

              <View className="flex-row justify-center items-start flex-wrap gap-3 w-auto">
                <View className="flex-1 flex-col items-center justify-start w-auto">
                  <Text className="text-lg font-bold mb-3">Video Format</Text>
                  {formats.formats.video.map((e) => {
                    const size =
                      e.contentLength &&
                      estimateDownloadSize(Number(e.contentLength));
                    return (
                      <View key={e.itag}>
                        <Button
                          title={`${e.qualityLabel} ${size && `(${size}Mb)`}`}
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
                <View className="flex-1 flex-col items-center w-auto">
                  <Text className="text-lg font-bold mb-3">Audio Format</Text>
                  {formats.formats.audio.slice(0, 3).map((e) => {
                    const size =
                      e.contentLength &&
                      estimateDownloadSize(Number(e.contentLength));
                    return (
                      <View key={e.itag} className="mb-3">
                        <Button
                          title={`${e.audioCodec == "opus" ? "Opus" : "M4A"} ${
                            size && `(${size}Mb)`
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
                    <Text className="text-white font-bold text-center">
                      {(progress * 100).toFixed(2)}%
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row items-end justify-end w-full p-3">
                <Button
                  containerStyle={{
                    width: "auto",
                  }}
                  //disabled={isDownloading?.state === true}
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
