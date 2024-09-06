import { useCallback, useEffect, useState } from "react";

import { View, Text, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { useFocusEffect } from "expo-router";
import {
  MediaType,
  VideoMaxDirPath,
  WhatsAppDirPath,
  WhatsAppTab,
} from "@/lib/constants";
import { Loading } from "@/components/Loading";
import { ScrollableTabs } from "@/components/Tabs";
import { MasonryList, MediaItem } from "@/components/ImageManager";
export default function WaDownloader() {
  const [imageMedia, setImageMedias] = useState<string[]>([]);
  const [videoMedia, setVideoMedias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();

  const getWhatsAppStatusMedia = useCallback(async function () {
    setLoading(true);
    if (Platform.OS !== "android") {
      setErrorMessage("This feature is only available on Android devise.");
      setLoading(false);
      return [];
    }

    try {
      // Read directory contents
      const files = await FileSystem.readDirectoryAsync(WhatsAppDirPath);

      // Filter for image and video files
      const imageFiles = files.filter(
        (file) =>
          file.endsWith(".jpg") ||
          file.endsWith(".png") ||
          file.endsWith(".jpeg")
      );
      const videoFiles = files.filter((file) => file.endsWith(".mp4"));
      setImageMedias([...imageFiles]);
      setVideoMedias([...videoFiles]);
      setLoading(false);
    } catch (error) {
      console.log("Error accessing WhatsApp status media:", error);
      setErrorMessage(
        "Error accessing WhatsApp media. Please verify you have WhatsApp installed, Add the storage permission and try again."
      );
      setLoading(false);
      return [];
    }
  }, []);

  async function getOrCreateDirectory() {
    try {
      // Check if directory exists
      const dirInfo = await FileSystem.getInfoAsync(VideoMaxDirPath);

      if (!dirInfo.exists) {
        // Create directory if it doesn't exist
        await FileSystem.makeDirectoryAsync(VideoMaxDirPath, {
          intermediates: true,
        });
      }

      return true;
    } catch (error) {
      console.error("Error creating directory:", error);
      return false;
    }
  }

  useEffect(() => {
    getOrCreateDirectory();
    getWhatsAppStatusMedia();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getWhatsAppStatusMedia();
      return () => {
        console.log("This route is now unfocused.");
      };
    }, [])
  );

  return (
    <View className="flex-1 flex-col bg-white">
      <View className="flex-1 flex-col justify-center">
        <View className="flex-1 flex-col justify-center">
          <View className="h-full flex-col bg-rose-700 justify-center">
            <ScrollableTabs
              tabs={WhatsAppTab}
              initialTab={0}
              tabsComponent={[
                <View className="flex-1">
                  {loading ? (
                    <Loading />
                  ) : errorMessage ? (
                    <View className="flex-1 items-center justify-center p-6">
                      <Text className=" text-center text-black/60">
                        {errorMessage}
                      </Text>
                    </View>
                  ) : (
                    <MasonryList
                      onRefresh={getWhatsAppStatusMedia}
                      mediaList={imageMedia.map<MediaItem>((media) => {
                        return {
                          id: media,
                          uri: media,
                        };
                      })}
                      mediaType={MediaType.PHOTO}
                    />
                  )}
                </View>,
                <View className="flex-1">
                  {loading ? (
                    <Loading />
                  ) : errorMessage ? (
                    <View className="flex-1 items-center justify-center p-6">
                      <Text className=" text-center text-black/60">
                        {errorMessage}
                      </Text>
                    </View>
                  ) : (
                    <MasonryList
                      onRefresh={getWhatsAppStatusMedia}
                      mediaList={videoMedia.map((media) => {
                        return {
                          id: media,
                          uri: media,
                        };
                      })}
                      mediaType={MediaType.VIDEO}
                    />
                  )}
                </View>,
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
