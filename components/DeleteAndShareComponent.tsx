import React, { useContext } from "react";
import { MediaListContext } from "@/components/MediaListContext";
import { useDatabase } from "./hooks/DatabaseProvider";
import { SpeedDial } from "@rneui/base";
import * as Sharing from "expo-sharing";
import { displayMessage } from "./Toast";

export const DeleteAndShareComponent: React.FC = () => {
  const { deleteData } = useDatabase();
  const [open, setOpen] = React.useState(true);
  const { mediaInfoList, handleItemDeletion, handleDeselectAll } =
    useContext(MediaListContext);

  const itemsSelected = mediaInfoList.flatMap((item) =>
    item.medias.filter((media) => media.isSelected)
  );

  const deleteItemSelected = () => {
    itemsSelected.forEach((item) => {
      handleItemDeletion(item.groupId, item.mediaUri);
      deleteData(item.mediaUri);
    });
  };

  const shareFile = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      displayMessage({
        message: "Sharing isn't available on your platform",
        messageType: "error",
      });
      return;
    }
    if (itemsSelected.length > 1) {
      displayMessage({
        message: "You can only share one file at a time",
        messageType: "error",
      });
      return;
    }
    const fileUri = itemsSelected[0].mediaUri;

    try {
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error sharing file:", error);
    }
  };

  if (itemsSelected.length < 1) {
    return null;
  }

  return (
    <SpeedDial
      isOpen={open}
      openIcon={{ name: "close", color: "#fff" }}
      onOpen={() => setOpen(() => true)}
      onClose={() => setOpen(() => false)}
      transitionDuration={150}
      icon={{ name: "edit", color: "#fff" }}
      buttonStyle={{ backgroundColor: "rgb(190, 18, 60)" }}
      style={{
        bottom: 50,
        backgroundColor: "transparent",
      }}
    >
      <SpeedDial.Action
        icon={{ name: "cancel", color: "#fff" }}
        buttonStyle={{ backgroundColor: "black" }}
        title="Cancel"
        titleStyle={{
          color: "white",
          backgroundColor: "black",
          fontFamily: "NerkoOne",
        }}
        onPress={handleDeselectAll}
      />
      <SpeedDial.Action
        icon={{ name: "delete", color: "#fff" }}
        title="Delete"
        buttonStyle={{ backgroundColor: "rgb(190, 18, 60)" }}
        onPress={deleteItemSelected}
        titleStyle={{
          color: "white",
          backgroundColor: "rgb(190, 18, 60)",
          fontFamily: "NerkoOne",
        }}
      />
      <SpeedDial.Action
        icon={{ name: "share", color: "#fff" }}
        buttonStyle={{ backgroundColor: "green" }}
        title="Share"
        titleStyle={{
          color: "white",
          backgroundColor: "green",
          fontFamily: "NerkoOne",
        }}
        onPress={shareFile}
      />
    </SpeedDial>
  );

  // return (
  //   <View
  //     className="bg-neutral-200 h-16 w-full p-4 flex-row justify-between"
  //     style={{ zIndex: 1 }}
  //   >
  //     <Pressable onPress={handleDeselectAll}>
  //       <MaterialCommunityIcons name="close-thick" size={24} color="black" />
  //     </Pressable>
  //     <Pressable className="h-10 w-28 bg-[#075E54] rounded-md flex items-center justify-center">
  //       <Text className="text-white text-center">
  //         SEND ({itemsSelected.length})
  //       </Text>
  //     </Pressable>
  //     <Pressable onPress={deleteItemSelected}>
  //       <MaterialIcons name="delete" size={24} color="black" />
  //     </Pressable>
  //   </View>
  // );
};
