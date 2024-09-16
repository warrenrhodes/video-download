import { cn } from "@/lib/utils";
import { Text } from "react-native";

export const Title = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Text
      className={cn(className, "text-primary")}
      style={{ fontFamily: "NerkoOne" }}
    >
      {children}
    </Text>
  );
};
