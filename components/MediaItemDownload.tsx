import React, { useContext, useState, useEffect } from "react";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Audio } from "expo-av";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { MediaListContext, MediaInfo } from "./MediaListContext";
import { blurhash, MediaType } from "@/lib/constants";
import { TouchableMedia } from "@/components/ImageManager";
import IconSelection from "@/components/IconSelection";
import { cn } from "@/lib/utils";

interface ImageHistoryProps {
  media: MediaInfo;
  groupId: string;
}

const ImageHistory: React.FC<ImageHistoryProps> = ({ media, groupId }) => {
  const { handleItemChange, mediaType } = useContext(MediaListContext);
  const [sound, setSound] = useState<Audio.Sound>();
  const [soundIsPlaying, setSoundIsPlaying] = useState<boolean>(false);
  async function playSound(url: string) {
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true }
    );
    setSound(sound);

    await sound.playAsync();
  }

  const handleSoundPress = async (uri: string) => {
    if (sound) {
      if (soundIsPlaying) {
        await sound.pauseAsync();

        setSoundIsPlaying(false);
        return;
      }
      await sound.playAsync();
      setSoundIsPlaying(true);
      return;
    }
    await playSound(uri);
    setSoundIsPlaying(true);
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.stopAsync();
          setSoundIsPlaying(false);
        }
      : undefined;
  }, [sound]);

  if (mediaType === MediaType.AUDIO) {
    return (
      <View className="relative size-20 bg-gray-800 rounded-xl overflow-hidden">
        <View className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black/20 items-center justify-center">
          <FontAwesome name="music" size={24} color="white" />
        </View>
        <Pressable
          className="absolute right-0 bottom-0 w-full h-full"
          onPress={() => handleSoundPress(media.mediaUri)}
        >
          {soundIsPlaying ? (
            <MaterialIcons
              name="pause-circle-outline"
              size={19}
              color="white"
              className="absolute right-1 bottom-1"
            />
          ) : (
            <MaterialIcons
              name="play-circle-outline"
              size={19}
              color="white"
              className="absolute right-1 bottom-1"
            />
          )}
        </Pressable>

        <View className="absolute top-0 right-0 m-1">
          <IconSelection
            isSelected={media.isSelected}
            onSelect={() => handleItemChange(groupId, media.mediaUri)}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="relative w-[123px] h-36">
      <Image
        style={{
          width: "100%",
          height: "100%",
        }}
        source={{ uri: media.mediaUri }}
        placeholder={blurhash}
        contentFit="cover"
        transition={1000}
      />
      <View
        className={cn(
          {
            "bg-black/50": media.isSelected,
          },
          "absolute top-0 left-0 w-full h-full"
        )}
      >
        <TouchableMedia uri={media.mediaUri} mediaType={mediaType} />
        <View className="absolute top-0 right-0">
          <IconSelection
            isSelected={media.isSelected}
            onSelect={() => handleItemChange(groupId, media.mediaUri)}
          />
        </View>
      </View>
    </View>
  );
};

export default ImageHistory;
