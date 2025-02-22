import { useState, useCallback, useEffect, useRef } from "react";
import { MediaType, VideoMaxDirPath, WhatsAppDirPath } from "@/lib/constants";
import * as FileSystem from "expo-file-system";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StyleSheet,
  Animated,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import DownloadImageButton from "./DownloadAnimation";
import { Video, ResizeMode } from "expo-av";
import { Overlay } from "@rneui/themed";
import { MasonryFlashList } from "@shopify/flash-list";

const { width, height } = Dimensions.get("window");

export interface MediaItem {
  id: string;
  uri: string;
}

const screenWidth = Dimensions.get("window").width;

export const WhatsAppMedia = (props: {
  media: string;
  mediaType: MediaType;
}) => {
  const imageUri = `${WhatsAppDirPath}${props.media}`;
  const [imageSaveInLocal, setImageSaveInLocal] = useState<boolean>();
  const video = useRef<Video>(null);
  const checkImageExistence = useCallback(async () => {
    try {
      const info = await FileSystem.getInfoAsync(
        `${VideoMaxDirPath}WhatsApp-${props.media}`
      );
      if (!info.exists) {
        setImageSaveInLocal(false);
        return;
      }
      setImageSaveInLocal(true);
    } catch (error) {
      console.info("Error checking image existence:", error);
    }
  }, []);

  useEffect(() => {
    checkImageExistence();
  }, []);
  if (props.mediaType === "videos" && imageSaveInLocal !== undefined) {
    return (
      <View className="justify-center items-center rounded-xl bg-neutral-300 overflow-hidden relative">
        <Video
          ref={video}
          source={{
            uri: imageUri,
          }}
          style={{
            width: 320,
            height: 150,
          }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
        />
        {!imageSaveInLocal ? (
          <View className="items-center justify-center bg-black/70 h-full w-full absolute inset-0">
            <DownloadImageButton
              imageSourceUri={imageUri}
              imageDestinationUri={`${VideoMaxDirPath}WhatsApp-${props.media}`}
              setImageDownloaded={setImageSaveInLocal}
            />
          </View>
        ) : (
          <View className="flex-1 absolute inset-0 h-screen w-screen">
            <TouchableMedia
              uri={`${VideoMaxDirPath}${props.media}`}
              mediaType={props.mediaType}
            />
          </View>
        )}
      </View>
    );
  }

  return (
    imageSaveInLocal !== undefined && (
      <ImageBackground
        key={props.media}
        source={{
          uri: imageUri,
        }}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
        className="rounded-xl object-contain"
      >
        {!imageSaveInLocal ? (
          <View className="items-center justify-center rounded-xl bg-black/50 h-full w-full">
            <DownloadImageButton
              imageSourceUri={imageUri}
              imageDestinationUri={`${VideoMaxDirPath}WhatsApp-${props.media}`}
              setImageDownloaded={setImageSaveInLocal}
            />
          </View>
        ) : (
          <TouchableMedia uri={imageUri} mediaType={props.mediaType} />
        )}
      </ImageBackground>
    )
  );
};

interface MasonryListProps {
  mediaList: MediaItem[];
  onRefresh: () => void;
  mediaType: MediaType;
}

export const MasonryList: React.FC<MasonryListProps> = ({
  mediaList,
  onRefresh,
  mediaType,
}) => {
  const ITEM_MARGIN = 5;

  // const renderItem = useCallback(
  //   ({ item }: { item: MediaItem }) => (
  //     <View
  //       className="mb-4 w-full h-full flex-1"
  //       style={{ flex: 1, margin: ITEM_MARGIN / 2 }}
  //     >
  //       <WhatsAppMedia media={item.uri} mediaType={mediaType} />
  //     </View>
  //   ),
  //   []
  // );
  const getItemSize = (index: number) => {
    const pattern = [
      { width: 1, height: 1 },
      { width: 1, height: 1.2 },
      { width: 1, height: 1.3 },
      { width: 1, height: 1.4 },
      { width: 1, height: 1.5 },
      { width: 1, height: 1.6 },
      { width: 1, height: 1.7 },
      { width: 1, height: 1 },
      { width: 1, height: 1.2 },
      { width: 1, height: 1.3 },
      { width: 1, height: 1.4 },
      { width: 1, height: 1.5 },
      { width: 1, height: 1 },
    ];
    return pattern[index % pattern.length];
  };

  const getColumnFlex = (_: any, index: number) => {
    const size = getItemSize(index);
    return size.width;
  };

  const renderItem = ({ item, index }: { item: MediaItem; index: number }) => {
    const size = getItemSize(index);
    const itemWidth = (width - 20) / 3;
    const itemHeight = itemWidth * size.height;

    return (
      <View
        className="mb-4"
        style={{
          margin: 1,
          width: itemWidth,
          height: itemHeight,
        }}
      >
        <WhatsAppMedia media={item.uri} mediaType={mediaType} />
      </View>
    );
  };

  return (
    <View className="flex-1">
      {mediaList.length === 0 ? (
        <View className="flex flex-col flex-1 justify-center items-center">
          <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={onRefresh} />
            }
          >
            <Text>No data found. Pull down to refresh the data.</Text>
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1 w-screen">
          <MasonryFlashList
            estimatedItemSize={200}
            numColumns={mediaType === "videos" ? 2 : 3}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ padding: 5 }}
            data={mediaList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            getColumnFlex={mediaType === "videos" ? undefined : getColumnFlex}
            onRefresh={onRefresh}
            refreshing={false}
          />
        </View>
      )}
    </View>
  );
};

export const TouchableMedia = (props: {
  uri: string;
  disabledPreview?: boolean;
  mediaType: MediaType;
}) => {
  const [displayLargeImage, setDisplayLargeImage] = useState(false);
  return (
    <TouchableOpacity
      className="h-full w-full relative"
      onPress={
        !props.disabledPreview ? () => setDisplayLargeImage(true) : () => {}
      }
    >
      <ImageViewer
        visible={displayLargeImage}
        imageUri={props.uri}
        onClose={() => setDisplayLargeImage(false)}
        mediaType={props.mediaType}
      />
    </TouchableOpacity>
  );
};

const ImageViewer = ({
  visible,
  imageUri,
  onClose,
  mediaType,
}: {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  mediaType: MediaType;
}) => {
  const [animation] = useState(new Animated.Value(0));
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (visible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (imageUri && mediaType === "photos") {
      Image.getSize(
        imageUri,
        (width, height) => {
          setImageSize({ width, height });
          setAspectRatio(width / height);
          setIsVideoLoading(false);
        },
        (error) => {
          console.info("Error loading image:", error);
          setIsVideoLoading(false);
        }
      );
    }
  }, [imageUri]);

  const imageScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const calculateDimensions = () => {
    if (imageSize.width > screenWidth) {
      return {
        width: screenWidth,
        height: screenWidth / aspectRatio,
      };
    }
    return imageSize;
  };
  return (
    <Overlay
      transparent
      isVisible={visible}
      onBackdropPress={() => {
        onClose();
        setIsVideoLoading(true);
      }}
      animationType="fade"
      backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      overlayStyle={{
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View>
        {mediaType === "videos" ? (
          <View className="w-full flex items-center justify-center required">
            <Video
              source={{
                uri: imageUri,
              }}
              style={{
                width: width,
                height: height * 0.7,
                maxWidth: 500,
                maxHeight: 500,
                backgroundColor: "black",
              }}
              shouldPlay={!isVideoLoading}
              useNativeControls
              isLooping
              resizeMode={ResizeMode.CONTAIN}
              onLoad={() => {
                setIsVideoLoading(false);
              }}
            />

            <View className="absolute inset-0 w-screen flex items-center justify-center z-20">
              {isVideoLoading && (
                <ActivityIndicator size="large" color="white" />
              )}
            </View>
          </View>
        ) : (
          <Animated.Image
            source={{ uri: imageUri }}
            style={[
              {
                width: calculateDimensions().width,
                height: calculateDimensions().height,
              },
              {
                transform: [{ scale: imageScale }],
              },
            ]}
            resizeMode="contain"
          />
        )}
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
