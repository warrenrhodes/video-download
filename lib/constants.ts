import * as FileSystem from "expo-file-system";

export const WhatsAppDirPath =
  "file:///storage/emulated/0/WhatsApp/Media/.Statuses/";
export const VideoMaxDirPath = `${FileSystem.documentDirectory}`;

export const WhatsAppTab = [
  {
    label: "Pictures",
    icons: "picture",
    iconType: "antdesign",
  },
  {
    label: "Videos",
    icons: "video-collection",
    iconType: "materialicons",
  },
];

export type MediaType = "photos" | "videos";

export const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";
