import { createContext, Reducer } from "react";
import { MediaType } from "@/lib/constants";

export interface MediaInfo {
  mediaUri: string;
  updatedAt: string;
  isSelected: boolean;
  groupId: string;
  title?: string;
}

export interface MediaGroup {
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

export const MediaListContext = createContext<MediaListContextProps>({
  mediaInfoList: [],
  handleItemChange: () => {},
  handleItemGroupSelect: () => {},
  handleItemGroupDeselect: () => {},
  handleItemDeletion: () => {},
  handleDeselectAll: () => {},
  mediaType: MediaType.PHOTO,
});

type Action =
  | { type: "selectItem"; groupId: string; itemId: string }
  | { type: "selectItemGroup"; groupId: string }
  | { type: "deselectItemGroup"; groupId: string }
  | { type: "deleteItem"; groupId: string; itemId: string }
  | { type: "updateMediaList"; mediaList: MediaGroup[] }
  | { type: "deselectAll" };

export const mediaListReducer: Reducer<MediaGroup[], Action> = (
  state,
  action
) => {
  switch (action.type) {
    case "selectItem":
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
    case "selectItemGroup":
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
    case "deselectItemGroup":
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
    case "deleteItem":
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
    case "deselectAll":
      return state.map((group) => ({
        ...group,
        isSelected: false,
        medias: group.medias.map((item) => ({ ...item, isSelected: false })),
      }));
    case "updateMediaList":
      return action.mediaList;
    default:
      return state;
  }
};
