import { cn } from "@/lib/utils";
import { View } from "react-native";

type SpacingPros = {
  size?: "sm" | "md" | "lg";
};

export const Spacing = ({ size = "sm" }: SpacingPros) => (
  <View
    className={cn({
      "h-8 lg:h-16": size === "sm",
      "h-16 lg:h-24": size === "md",
      "h-24 lg:h-32": size === "lg",
    })}
  />
);
