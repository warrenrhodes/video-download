import React, { useReducer, useEffect, useContext } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import {
  MediaGroup,
  MediaListContext,
  mediaListReducer,
} from "@/components/MediaListContext";
import { MediaType } from "@/lib/constants";
import { DeleteAndShareComponent } from "@/components/DeleteAndShareComponent";
import * as FileSystem from "expo-file-system";
import { MediaListParentContext } from "./hooks/UseMediaList";
import { ImageHistoryList } from "./MediaItemsDownloadList";
import { Title } from "./Title";

interface FlashMediaListProps {
  onRefresh: () => void;
  medias: Record<string, MediaGroup>;
  mediaType: MediaType;
}

const FlashMediaList: React.FC<FlashMediaListProps> = ({
  medias,
  mediaType,
}) => {
  const { refreshing, refreshMedia } = useContext(MediaListParentContext);
  const [mediaList, dispatch] = useReducer(
    mediaListReducer,
    Object.values(medias)
  );

  useEffect(() => {
    dispatch({ type: "updateMediaList", mediaList: Object.values(medias) });
  }, [medias]);

  const handleItemChange = (groupId: string, itemId: string) => {
    dispatch({ type: "selectItem", groupId, itemId });
  };

  const handleItemGroupSelect = (groupId: string) => {
    dispatch({ type: "selectItemGroup", groupId });
  };

  const handleItemGroupDeselect = (groupId: string) => {
    dispatch({ type: "deselectItemGroup", groupId });
  };

  const handleDeselectAll = () => {
    dispatch({ type: "deselectAll" });
  };

  const handleItemDeletion = async (groupId: string, itemId: string) => {
    try {
      dispatch({ type: "deleteItem", groupId, itemId });
      await FileSystem.deleteAsync(itemId);
    } catch (error) {
      console.info("Error deleting file:", error);
    }
  };

  if (mediaList.length < 1) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refreshMedia} />
        }
      >
        <Title className="text-center text-xl !text-muted-foreground">
          No data found. Pull down to refresh the data.
        </Title>
      </ScrollView>
    );
  }

  return (
    <MediaListContext.Provider
      value={{
        mediaInfoList: mediaList,
        handleItemChange,
        handleItemGroupSelect,
        handleItemGroupDeselect,
        handleItemDeletion,
        handleDeselectAll,
        mediaType,
      }}
    >
      <View className="flex-1 w-screen">
        <FlashList
          data={mediaList}
          estimatedItemSize={200}
          renderItem={({ item }) => <ImageHistoryList mediaGroup={item} />}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{ padding: 2 }}
          onRefresh={refreshMedia}
          refreshing={refreshing}
        />
      </View>
      <DeleteAndShareComponent />
    </MediaListContext.Provider>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FlashMediaList;
