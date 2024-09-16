import LottieView from "lottie-react-native";

export interface LoadingProps {
  color?: string;
  size?: number;
  assetAnimationJson?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  color,
  size,
  assetAnimationJson,
}) => {
  return (
    <LottieView
      autoPlay
      style={{
        width: size ?? 90,
        height: size ?? 90,
        backgroundColor: color,
      }}
      source={require("@/assets/animations/whatsApp-loading.json")}
    />
  );
};
