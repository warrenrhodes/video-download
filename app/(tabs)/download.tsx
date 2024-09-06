import { cn } from "@/lib/utils";
import {
  createContext,
  Reducer,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from "react-native";
import * as FileSystem from "expo-file-system";
import {
  blurhash,
  MediaType,
  VideoMaxDirPath,
  WhatsAppTab,
} from "@/lib/constants";
import { DateFormatter } from "@/lib/date";
import { FlashList } from "@shopify/flash-list";
import Animated, { FadeIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { TouchableMedia } from "@/components/ImageManager";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Loading } from "@/components/Loading";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollableTabs } from "@/components/Tabs";
import { Audio } from "expo-av";
import FontAwesome from "@expo/vector-icons/FontAwesome";

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

interface MediaListContextProps {
  mediaInfoList: MediaGroup[];
  handleItemChange: (groupId: string, itemId: string) => void;
  handleItemGroupSelect: (groupId: string) => void;
  handleItemGroupDeselect: (groupId: string) => void;
  handleItemDeletion: (groupId: string, itemId: string) => void;
  handleDeselectAll: () => void;
  mediaType: MediaType;
}
const initialValue: MediaListContextProps = {
  mediaInfoList: [],
  handleItemChange: () => {},
  handleItemGroupSelect: () => {},
  handleItemGroupDeselect: () => {},
  handleItemDeletion: () => {},
  handleDeselectAll: () => {},
  mediaType: MediaType.PHOTO,
};
const MediaListContext = createContext(initialValue);

export type ActionType = "selectItem" | "deleted" | "selectAll" | "deselectAll";
type Action =
  | { type: "selectItem"; groupId: string; itemId: string }
  | { type: "selectItemGroup"; groupId: string }
  | { type: "deselectItemGroup"; groupId: string }
  | { type: "deleteItem"; groupId: string; itemId: string }
  | { type: "updateMediaList"; mediaList: MediaGroup[] }
  | { type: "deselectAll" };

const imageListReducer: Reducer<MediaGroup[], Action> = (state, action) => {
  switch (action.type) {
    case "selectItem": {
      return state.map((group) =>
        group.date === action.groupId
          ? {
              ...group,
              isSelected: false,
              medias: group.medias.map((item) =>
                item.mediaUri === action.itemId
                  ? { ...item, isSelected: !item.isSelected }
                  : item
              ),
            }
          : group
      );
    }
    case "selectItemGroup": {
      return state.map((group) =>
        group.date === action.groupId
          ? {
              ...group,
              isSelected: true,
              medias: group.medias.map((item) => ({
                ...item,
                isSelected: true,
              })),
            }
          : group
      );
    }
    case "deselectItemGroup": {
      return state.map((group) =>
        group.date === action.groupId
          ? {
              ...group,
              isSelected: false,
              medias: group.medias.map((item) => ({
                ...item,
                isSelected: false,
              })),
            }
          : group
      );
    }
    case "deleteItem": {
      return state
        .map((group) =>
          group.date === action.groupId
            ? {
                ...group,
                medias: group.medias.filter(
                  (item) => item.mediaUri !== action.itemId
                ),
              }
            : group
        )
        .filter((group) => group.medias.length > 0);
    }
    case "deselectAll": {
      return state.map((group) => ({
        ...group,
        isSelected: false,
        medias: group.medias.map((item) => ({
          ...item,
          isSelected: false,
        })),
      }));
    }
    case "updateMediaList": {
      return action.mediaList;
    }
    default: {
      throw new Error("Unknown action: " + (action as any).type);
    }
  }
};

export default function WhatsAppDownloadHistory() {
  const [imageMedia, setImageMedias] = useState<Record<string, MediaGroup>>({});
  const [videoMedia, setVideoMedias] = useState<Record<string, MediaGroup>>({});
  const [audioMedias, setAudioMedias] = useState<Record<string, MediaGroup>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  //const [tasks, dispatch] = useReducer(imageReducer, props.items[1]);
  const [refreshing, setRefreshing] = useState(false);

  const getVideoMaxStatusMedia = useCallback(async function () {
    try {
      // Read directory contents
      const files = await FileSystem.readDirectoryAsync(VideoMaxDirPath);

      // Filter for image and video files
      const mediaFiles = files.filter(
        (file) =>
          file.endsWith(".jpg") ||
          file.endsWith(".mp4") ||
          file.endsWith(".png") ||
          file.endsWith(".jpeg") ||
          file.endsWith(".mp3") ||
          file.endsWith(".m4a") ||
          file.endsWith(".opus") ||
          file.endsWith(".webm")
      );
      const imageMediasData: Record<string, MediaGroup> = {};
      const videoMediasData: Record<string, MediaGroup> = {};
      const audioMediasData: Record<string, MediaGroup> = {};

      for (const file of mediaFiles) {
        const fileInfo = await FileSystem.getInfoAsync(
          `${VideoMaxDirPath}${file}`
        );
        if (fileInfo.exists && !fileInfo.isDirectory) {
          const date = DateFormatter.formatDate(
            new Date(fileInfo.modificationTime * 1000),
            "medium"
          );
          if (
            file.endsWith(".jpg") ||
            file.endsWith(".png") ||
            file.endsWith(".jpeg")
          ) {
            imageMediasData[date] = {
              isSelected: false,
              date: date,
              medias: [
                {
                  mediaUri: `${VideoMaxDirPath}${file}`,
                  updatedAt: date,
                  isSelected: false,
                  groupId: date,
                  title: file,
                },
                ...(imageMediasData[date]?.medias || []),
              ],
            };
          } else if (file.endsWith(".mp4" || file.endsWith(".webm"))) {
            videoMediasData[date] = {
              isSelected: false,
              date: date,
              medias: [
                {
                  mediaUri: `${VideoMaxDirPath}${file}`,
                  updatedAt: date,
                  isSelected: false,
                  groupId: date,
                  title: file,
                },
                ...(videoMediasData[date]?.medias || []),
              ],
            };
          } else if (
            file.endsWith(
              ".mp3" || file.endsWith(".opus") || file.endsWith(".m4a")
            )
          ) {
            audioMediasData[date] = {
              isSelected: false,
              date: date,
              medias: [
                {
                  mediaUri: `${VideoMaxDirPath}${file}`,
                  updatedAt: date,
                  isSelected: false,
                  groupId: date,
                  title: file,
                },
                ...(audioMediasData[date]?.medias || []),
              ],
            };
          }
        }
      }
      setImageMedias({
        ...imageMediasData,
      });
      setVideoMedias({
        ...videoMediasData,
      });
      setAudioMedias({
        ...audioMediasData,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error accessing to media media:", error);
      setLoading(false);
      return [];
    }
  }, []);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(async () => {
      await getVideoMaxStatusMedia();
      setRefreshing(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (
      Object.entries(imageMedia).length === 0 ||
      Object.entries(videoMedia).length === 0 ||
      Object.entries(audioMedias).length === 0
    ) {
      getVideoMaxStatusMedia();
    }
  }, []);
  return (
    <View className="flex-1 flex-col bg-white">
      <View className="h-full flex-col bg-rose-700 justify-center">
        <ScrollableTabs
          tabs={WhatsAppTab}
          initialTab={0}
          tabsComponent={[
            <View className="flex-1">
              {loading ? (
                <Loading />
              ) : (
                <FlashMediaList
                  onRefresh={onRefresh}
                  medias={imageMedia}
                  refreshing={refreshing}
                  mediaType={MediaType.PHOTO}
                />
              )}
            </View>,
            <View className="flex-1">
              {loading ? (
                <Loading />
              ) : (
                <FlashMediaList
                  onRefresh={onRefresh}
                  medias={videoMedia}
                  refreshing={refreshing}
                  mediaType={MediaType.VIDEO}
                />
              )}
            </View>,
            <View className="flex-1">
              {loading ? (
                <Loading />
              ) : (
                <FlashMediaList
                  onRefresh={onRefresh}
                  medias={audioMedias}
                  refreshing={refreshing}
                  mediaType={MediaType.AUDIO}
                />
              )}
            </View>,
          ]}
        />
      </View>
    </View>
  );
}

const FlashMediaList = (props: {
  onRefresh: () => void;
  medias: Record<string, MediaGroup>;
  refreshing: boolean;
  mediaType: MediaType;
}) => {
  const [mediaList, dispatch] = useReducer(
    imageListReducer,
    Object.values(props.medias)
  );

  useEffect(() => {
    dispatch({
      type: "updateMediaList",
      mediaList: Object.values(props.medias),
    });
  }, [props.medias]);

  function handleItemChange(groupId: string, itemId: string) {
    dispatch({
      type: "selectItem",
      groupId: groupId,
      itemId: itemId,
    });
  }
  function handleItemGroupSelect(groupId: string) {
    dispatch({
      type: "selectItemGroup",
      groupId: groupId,
    });
  }
  function handleItemGroupDeselect(groupId: string) {
    dispatch({
      type: "deselectItemGroup",
      groupId: groupId,
    });
  }

  function handleDeselectAll() {
    dispatch({
      type: "deselectAll",
    });
  }

  async function handleItemDeletion(groupId: string, itemId: string) {
    try {
      dispatch({
        type: "deleteItem",
        groupId: groupId,
        itemId: itemId,
      });
      await FileSystem.deleteAsync(itemId);
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      console.log("File deleted successfully");
    }
  }

  const renderItem = ({ item }: { item: MediaGroup }) => (
    <ImageHistoryList mediaGroup={item} />
  );

  if (mediaList.length < 1) {
    return (
      <View className="flex flex-col flex-1 justify-center items-center">
        <ScrollView
          contentContainerStyle={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={props.onRefresh} />
          }
        >
          <Text>No data found. Pull down to refresh the data.</Text>
        </ScrollView>
      </View>
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
        mediaType: props.mediaType,
      }}
    >
      <View className="relative flex-1">
        <FlashList
          data={mediaList}
          renderItem={renderItem}
          estimatedItemSize={200}
          numColumns={1}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{ paddingHorizontal: 2 }}
          onRefresh={props.onRefresh}
          refreshing={props.refreshing}
        />
        <View className="absolute bottom-20 h-16 w-full">
          <DeleteAndShareComponent />
        </View>
      </View>
    </MediaListContext.Provider>
  );
};

const ImageHistoryList = (props: { mediaGroup: MediaGroup }) => {
  const { handleItemGroupSelect, handleItemGroupDeselect } =
    useContext(MediaListContext);
  return (
    <Animated.View entering={FadeIn} className="mb-2">
      <View className="bg-neutral-200 h-16 w-full  p-4 flex-row justify-between">
        <Text className="text-neutral-900"> {props.mediaGroup.date}</Text>
        <IconSelection
          isSelected={props.mediaGroup.isSelected}
          onSelect={() =>
            props.mediaGroup.isSelected
              ? handleItemGroupDeselect(props.mediaGroup.date)
              : handleItemGroupSelect(props.mediaGroup.date)
          }
        />
      </View>
      <View className="flex-row w-full h-full flex flex-wrap gap-1 p-1">
        {props.mediaGroup.medias.map((media) => (
          <View key={media.mediaUri} className="w-[123px]">
            <ImageHistory media={media} groupId={props.mediaGroup.date} />
            {media.title && (
              <Text className="truncate line-clamp-2 text-[12px]">
                {media.title}
              </Text>
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const ImageHistory = (props: { media: MediaInfo; groupId: string }) => {
  const { handleItemChange, mediaType } = useContext(MediaListContext);
  const [sound, setSound] = useState<Audio.Sound>();
  const [soundIsPlaying, setSoundIsPlaying] = useState<boolean>(false);
  const { media, groupId } = props;

  async function playSound(url: string) {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true }
    );
    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  }

  const handleSoundPress = async (uri: string) => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded == true && status.isPlaying == true) {
        sound.pauseAsync();
        setSoundIsPlaying(false);
      } else if (status.isLoaded == true && status.isPlaying == false) {
        sound.playAsync();
        setSoundIsPlaying(true);
      }
      return;
    }
    await playSound(uri);
    setSoundIsPlaying(true);
  };

  if (mediaType === MediaType.AUDIO) {
    return (
      <View className="relative w-[123px] h-36 bg-gray-800 rounded-xl overflow-hidden">
        <View className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black/20 items-center justify-center">
          <FontAwesome name="music" size={64} color="white" />
        </View>
        <Pressable
          className="absolute right-1 bottom-1 w-full h-full"
          onPress={() => handleSoundPress(media.mediaUri)}
        >
          {soundIsPlaying ? (
            <MaterialIcons
              name="pause-circle-outline"
              size={35}
              color="white"
              className="absolute right-1 bottom-1 "
            />
          ) : (
            <MaterialIcons
              name="play-circle-outline"
              size={35}
              color="white"
              className="absolute right-1 bottom-1 "
            />
          )}
        </Pressable>
      </View>
    );
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);
  return (
    <View className="relative w-[123px] h-36">
      <Image
        key={media.mediaUri}
        style={{
          width: "100%",
          height: "100%",
        }}
        source={{ uri: media.mediaUri }}
        placeholder={{ blurhash }}
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
        <View className="absolute top-0 right-0 ">
          <IconSelection
            isSelected={media.isSelected}
            onSelect={() => handleItemChange(groupId, media.mediaUri)}
          />
        </View>
      </View>
    </View>
  );
};

const IconSelection = ({
  onSelect,
  isSelected,
}: {
  onSelect: () => void;
  isSelected: boolean;
}) => {
  return isSelected ? (
    <Pressable onPress={onSelect}>
      <AntDesign
        name="checkcircle"
        size={19}
        color="#25d366"
        className=" bg-white rounded-full m-1"
      />
    </Pressable>
  ) : (
    <Pressable onPress={onSelect}>
      <Entypo
        name="circle"
        size={19}
        color="white"
        className=" bg-black/25 rounded-full m-1"
      />
    </Pressable>
  );
};

const DeleteAndShareComponent = (props: {}) => {
  const { mediaInfoList, handleItemDeletion, handleDeselectAll } =
    useContext(MediaListContext);
  let itemsSelected: MediaInfo[] = [];
  mediaInfoList.forEach((item) => {
    item.medias.forEach((media) => {
      if (media.isSelected) {
        itemsSelected.push(media);
      }
    });
  });
  const deleteItemSelected = () => {
    itemsSelected.forEach((item) => {
      handleItemDeletion(item.groupId, item.mediaUri);
    });
  };
  return (
    <View>
      {itemsSelected.length < 1 ? (
        <View />
      ) : (
        <View
          className="bg-neutral-200 h-16 w-full p-4 flex-row justify-between"
          style={{ zIndex: 1 }}
        >
          <Pressable>
            <MaterialCommunityIcons
              name="close-thick"
              size={24}
              color="black"
              onPress={handleDeselectAll}
            />
          </Pressable>
          <Pressable className=" h-10 w-28 bg-[#075E54] rounded-md flex items-center justify-center">
            <Text className="text-white text-center">
              SEND ({itemsSelected.length})
            </Text>
          </Pressable>
          <Pressable onPress={deleteItemSelected}>
            <MaterialIcons name="delete" size={24} color="black" />
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
