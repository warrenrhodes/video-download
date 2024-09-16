import React from "react";
import { Pressable } from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";

interface IconSelectionProps {
  onSelect: () => void;
  isSelected: boolean;
}

const IconSelection: React.FC<IconSelectionProps> = ({
  onSelect,
  isSelected,
}) => {
  return isSelected ? (
    <Pressable onPress={onSelect}>
      <AntDesign
        name="checkcircle"
        size={19}
        color="#25d366"
        className="bg-white rounded-full"
      />
    </Pressable>
  ) : (
    <Pressable onPress={onSelect}>
      <Entypo name="circle" size={19} color="white" className="rounded-full" />
    </Pressable>
  );
};

export default IconSelection;
