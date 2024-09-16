import { View } from "react-native";
import { ScrollableTabs } from "@/components/Tabs";
import { WhatsAppTab, MediaType } from "@/lib/constants";
import { Loading } from "@/components/Loading";

import FlashMediaList from "@/components/FlashMediaList";
import { useContext } from "react";
import {
  MediaListParentContext,
  ParentMediaList,
} from "@/components/hooks/UseMediaList";

export default function WhatsAppDownloadHistory() {
  return (
    <ParentMediaList>
      <View className="flex-1 flex-col bg-background">
        <View className="h-full flex-col bg-primary/20 justify-center overflow-hidden">
          <PrivateScrollableTabs />
        </View>
      </View>
    </ParentMediaList>
  );
}

const PrivateScrollableTabs = () => {
  const { imageMedia, videoMedia, audioMedia, refreshMedia, loading } =
    useContext(MediaListParentContext);

  return (
    <ScrollableTabs
      tabs={WhatsAppTab}
      initialTab={0}
      tabsComponent={[
        <View className="flex-1 flex-col w-screen bg-background justify-center items-center">
          {loading ? (
            <Loading />
          ) : (
            <FlashMediaList
              medias={imageMedia}
              onRefresh={refreshMedia}
              mediaType={MediaType.PHOTO}
            />
          )}
        </View>,
        <View className="flex-1 flex-col w-screen bg-background justify-center items-center">
          {loading ? (
            <Loading />
          ) : (
            <FlashMediaList
              medias={videoMedia}
              onRefresh={refreshMedia}
              mediaType={MediaType.VIDEO}
            />
          )}
        </View>,
        <View className="flex-1 flex-col w-screen bg-background justify-center items-center">
          {loading ? (
            <Loading />
          ) : (
            <FlashMediaList
              medias={audioMedia}
              onRefresh={refreshMedia}
              mediaType={MediaType.AUDIO}
            />
          )}
        </View>,
      ]}
    />
  );
};
