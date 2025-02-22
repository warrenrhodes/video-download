import React, { useCallback, useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { MediaListContext, MediaGroup } from "./MediaListContext";
import ImageHistory from "@/components/MediaItemDownload";
import IconSelection from "@/components/IconSelection";
import { useDatabase } from "./hooks/DatabaseProvider";
import { Title } from "./Title";

interface ImageHistoryListProps {
  mediaGroup: MediaGroup;
}

export const ImageHistoryList: React.FC<ImageHistoryListProps> = ({
  mediaGroup,
}) => {
  const { handleItemGroupSelect, handleItemGroupDeselect } =
    useContext(MediaListContext);

  return (
    <View className="mb-2">
      <View className="bg-primary/10 h-16 w-full p-4 flex-row justify-between">
        <Title className=" !text-foreground/80 text-xl">
          {mediaGroup.date}
        </Title>
        <IconSelection
          isSelected={mediaGroup.isSelected}
          onSelect={() =>
            mediaGroup.isSelected
              ? handleItemGroupDeselect(mediaGroup.date)
              : handleItemGroupSelect(mediaGroup.date)
          }
        />
      </View>
      <View className="flex-row w-full h-full flex flex-wrap gap-1 p-1">
        {mediaGroup.medias.map((media) => (
          <ItemMedia
            key={media.mediaUri}
            media={media}
            groupId={mediaGroup.date}
          />
        ))}
      </View>
    </View>
  );
};

const ItemMedia = ({
  media,
  groupId,
}: {
  media: MediaGroup["medias"][0];
  groupId: string;
}) => {
  const { getData } = useDatabase();
  const [fileDisplayName, setFileDisplayName] = useState<string>("");

  const getValidDisplayName = useCallback(async (uri: string) => {
    const _media = await getData<{
      title: string;
      displayName: string;
    }>(uri);
    setFileDisplayName(_media?.displayName ?? media.title ?? "");
  }, []);

  useEffect(() => {
    if (media.mediaUri) {
      getValidDisplayName(media.mediaUri);
    }
  }, [media.mediaUri]);

  return (
    <View key={media.mediaUri} className="w-[123px]">
      <ImageHistory media={media} groupId={groupId} />
      {media.title && (
        <Title className="truncate line-clamp-2 !text-foreground/70">
          {fileDisplayName}
        </Title>
      )}
    </View>
  );
};
