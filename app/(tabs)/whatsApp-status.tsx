import { useCallback, useEffect, useState } from "react";

import { View, Platform, Linking, TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system";
import { useFocusEffect } from "expo-router";
import {
  MediaType,
  VideoMaxDirPath,
  WhatsAppDirPath,
  WhatsAppTabIcons,
} from "@/lib/constants";
import { Loading } from "@/components/Loading";
import { ScrollableTabs } from "@/components/Tabs";
import { MasonryList, MediaItem } from "@/components/ImageManager";
import { Title } from "@/components/Title";
import * as IntentLauncher from "expo-intent-launcher";
import * as Application from "expo-application";
import * as MediaLibrary from "expo-media-library";

export default function WaDownloader() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [imageMedia, setImageMedias] = useState<string[]>([]);
  const [videoMedia, setVideoMedias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();

  const getWhatsAppStatusMedia = useCallback(async function () {
    setLoading(true);
    const permission = await verifyPermission();
    if (!permission) {
      return;
    }
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
        "Error accessing WhatsApp media. Please verify you have WhatsApp installed and try again."
      );
      setLoading(false);
      return [];
    }
  }, []);

  function openAppSettings() {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        { data: "package:" + Application.applicationId }
      );
    }
  }

  const verifyPermission = async (): Promise<boolean> => {
    if (permissionResponse?.status == "granted") {
      return true;
    }
    const result = await requestPermission();
    if (!result.granted && !result.canAskAgain) {
      setErrorMessage(
        "Permission to the media library is required to display the WhatsApp status media."
      );
      setLoading(false);
      return false;
    }
    return true;
  };

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
    }, [])
  );

  return (
    <View className="flex-1 flex-col bg-background w-full">
      <View className="h-full flex-col bg-primary/20 w-full">
        <ScrollableTabs
          tabs={WhatsAppTabIcons}
          initialTab={0}
          tabsComponent={[
            <View className="flex-1 flex-col w-screen bg-background justify-center items-center">
              {loading ? (
                <View className="flex-1 items-center justify-center p-6">
                  <Loading />
                </View>
              ) : errorMessage ? (
                <View className="flex-1 items-center justify-center p-6 flex-col gap-3">
                  <Title className=" text-center text-xl !text-foreground">
                    {errorMessage}
                  </Title>
                  {permissionResponse?.status != "granted" && (
                    <View className=" items-center justify-center flex-row gap-5">
                      <TouchableOpacity
                        className="bg-primary rounded-lg p-3 items-center"
                        onPress={getWhatsAppStatusMedia}
                      >
                        <Title className="!text-white text-xl">Reload</Title>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-primary rounded-lg p-3 items-center"
                        onPress={openAppSettings}
                      >
                        <Title className="!text-white text-xl">
                          Request Permission
                        </Title>
                      </TouchableOpacity>
                    </View>
                  )}
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
            <View className="flex-1 flex-col w-screen bg-background justify-center items-center">
              {loading ? (
                <View className="flex-1 items-center justify-center p-6">
                  <Loading />
                </View>
              ) : errorMessage ? (
                <View className="flex-1 items-center justify-center p-6 flex-col gap-3">
                  <Title className=" text-center text-xl !text-foreground">
                    {errorMessage}
                  </Title>
                  {permissionResponse?.status != "granted" && (
                    <View className=" items-center justify-center flex-row gap-5">
                      <TouchableOpacity
                        className="bg-primary rounded-lg p-3 items-center"
                        onPress={getWhatsAppStatusMedia}
                      >
                        <Title className="!text-white text-xl">Reload</Title>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-primary rounded-lg p-3 items-center"
                        onPress={openAppSettings}
                      >
                        <Title className="!text-white text-xl">
                          Request Permission
                        </Title>
                      </TouchableOpacity>
                    </View>
                  )}
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
  );
}
