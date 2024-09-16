import { useState, useCallback, createContext, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { VideoMaxDirPath } from "@/lib/constants";
import { DateFormatter } from "@/lib/date";
import { ViewProps } from "react-native";

interface MediaInfo {
  mediaUri: string;
  updatedAt: string;
  isSelected: boolean;
  groupId: string;
  title?: string;
}

interface MediaGroup {
  isSelected: boolean;
  date: string;
  medias: MediaInfo[];
}

interface MediaListParentContextProps {
  imageMedia: Record<string, MediaGroup>;
  videoMedia: Record<string, MediaGroup>;
  audioMedia: Record<string, MediaGroup>;
  refreshMedia: () => void;
  loading: boolean;
  refreshing: boolean;
}

export const MediaListParentContext =
  createContext<MediaListParentContextProps>({
    imageMedia: {},
    videoMedia: {},
    audioMedia: {},
    refreshMedia: () => {},
    loading: true,
    refreshing: false,
  });

export const ParentMediaList = (props: ViewProps) => {
  const [imageMedia, setImageMedia] = useState<Record<string, MediaGroup>>({});
  const [videoMedia, setVideoMedia] = useState<Record<string, MediaGroup>>({});
  const [audioMedia, setAudioMedia] = useState<Record<string, MediaGroup>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refreshMedia = useCallback(async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(VideoMaxDirPath);
      const mediaFiles = files.filter((file) =>
        /\.(jpg|mp4|png|jpeg|mp3|m4a|opus|webm)$/i.test(file)
      );
      const newImageMedia: Record<string, MediaGroup> = {};
      const newVideoMedia: Record<string, MediaGroup> = {};
      const newAudioMedia: Record<string, MediaGroup> = {};

      for (const file of mediaFiles) {
        const fileInfo = await FileSystem.getInfoAsync(
          `${VideoMaxDirPath}${file}`
        );
        if (fileInfo.exists && !fileInfo.isDirectory) {
          const date = DateFormatter.formatDate(
            new Date(fileInfo.modificationTime * 1000),
            "medium"
          );
          const mediaInfo: MediaInfo = {
            mediaUri: `${VideoMaxDirPath}${file}`,
            updatedAt: date,
            isSelected: false,
            groupId: date,
            title: file,
          };
          if (/\.(jpg|png|jpeg)$/i.test(file)) {
            updateMediaGroup(newImageMedia, date, mediaInfo);
          } else if (/\.(mp4|webm)$/i.test(file)) {
            updateMediaGroup(newVideoMedia, date, mediaInfo);
          } else if (/\.(mp3|opus|m4a)$/i.test(file)) {
            updateMediaGroup(newAudioMedia, date, mediaInfo);
          }
        }
      }
      setImageMedia(newImageMedia);
      setVideoMedia(newVideoMedia);
      setAudioMedia(newAudioMedia);
      setLoading(false);
    } catch (error) {
      console.error("Error accessing media:", error);
      setLoading(false);
    }
  }, []);

  const updateMediaGroup = (
    mediaObject: Record<string, MediaGroup>,
    date: string,
    mediaInfo: MediaInfo
  ) => {
    if (!mediaObject[date]) {
      mediaObject[date] = { isSelected: false, date, medias: [] };
    }
    mediaObject[date].medias.push(mediaInfo);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(async () => {
      await refreshMedia();
      setRefreshing(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (
      Object.entries(imageMedia).length === 0 ||
      Object.entries(videoMedia).length === 0 ||
      Object.entries(audioMedia).length === 0
    ) {
      refreshMedia();
    }
  }, []);

  return (
    <MediaListParentContext.Provider
      value={{
        refreshing,
        loading,
        imageMedia,
        videoMedia,
        audioMedia,
        refreshMedia: onRefresh,
      }}
    >
      {props.children}
    </MediaListParentContext.Provider>
  );
};
