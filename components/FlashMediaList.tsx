import React, { useReducer, useEffect, useContext } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
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
  console.log(mediaList);
  console.log(mediaList[0]?.medias);

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
      console.log("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
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
        <Title className="text-center text-xl !text-foreground">
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
      <View
        style={{
          flex: 1,
          height: Dimensions.get("window").height - 100,
          width: Dimensions.get("window").width,
        }}
      >
        <FlashList
          data={mediaList}
          estimatedItemSize={200}
          renderItem={({ item }) => <ImageHistoryList mediaGroup={item} />}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{ paddingBottom: 2 }}
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
