import {
  downloadAndProcessYouTubeVideo,
  fetchYouTubeVideoByUrl,
  MergeVideoAndAudioData,
  YTRequestFormatWithSortedFormats,
} from "@/lib/download_request";
import { Button, Overlay } from "@rneui/themed";
import { useCallback, useEffect, useState } from "react";
import { View, Animated, Text } from "react-native";
import { Loading } from "./Loading";

export const YouTubeDownloadBox = (props: {
  isLoaded: boolean;
  url: string;
  callback: (isLoaded: boolean) => void;
}) => {
  const [formats, setFormats] = useState<YTRequestFormatWithSortedFormats>();
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState<{
    state: boolean;
    resolution: string;
  }>();

  const downloadVideo = async (
    videoAndAudioData: MergeVideoAndAudioData,
    title: string
  ) => {
    try {
      setProgress(0);
      setIsDownloading({
        state: true,
        resolution: videoAndAudioData.resolution,
      });
      const downloadedPath = await downloadAndProcessYouTubeVideo(
        title,
        videoAndAudioData,
        (progressValue) => setProgress(progressValue)
      );
      if (!downloadedPath) {
        setIsDownloading(undefined);
        setProgress(0);
        return;
      }
      console.log("Video downloaded and processed:", downloadedPath);
    } catch (error) {
      console.error("Error downloading video:", error);
    } finally {
      setProgress(0);
    }
  };

  const _fetchYouTubeVideoByUrl = useCallback(async (url: string) => {
    try {
      const videoData = await fetchYouTubeVideoByUrl(url);
      if (!videoData) {
        return;
      }
      setFormats(videoData);
    } catch (error) {
      console.error("Error fetching YouTube video data:", error);
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
        backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8  )" }}
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
            <View className="justify-center items-center bg-white h-auto w-full">
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

              <View className="p-3">
                <Text className="text-lg font-bold mb-3">Resolution</Text>
                <View className="flex-row justify-center items-center flex-wrap gap-3">
                  {formats.sortedFormats.map((e) => (
                    <View key={e.resolution}>
                      <Button
                        title={`${e.resolution}  (${e.estimatedDownloadSize}Mb)`}
                        key={e.resolution}
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
                          isDownloading?.resolution === e.resolution
                        }
                        disabled={
                          isDownloading?.state &&
                          isDownloading?.resolution !== e.resolution
                        }
                      />
                    </View>
                  ))}
                </View>
              </View>

              <View className="w-full p-4">
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
