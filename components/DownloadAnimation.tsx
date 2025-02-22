import { useState, useRef } from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as FileSystem from "expo-file-system";

const DownloadImageButton = ({
  imageSourceUri,
  imageDestinationUri,
  size = 50,
  setImageDownloaded,
}: {
  size?: number;
  imageSourceUri: string;
  imageDestinationUri: string;
  setImageDownloaded: (value: boolean) => void;
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const startDownload = async () => {
    setIsDownloading(true);

    try {
      Animated.timing(progress, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(async () => {
        await FileSystem.copyAsync({
          from: imageSourceUri,
          to: imageDestinationUri,
        });
        setImageDownloaded(true);
        setIsDownloading(false);
        progress.setValue(0);
      });
    } catch (error) {
      console.info("Download error:", error);
    }
  };

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const circleCircumference = 2 * Math.PI * (size / 2 - 2);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circleCircumference, 0],
  });

  return (
    <TouchableOpacity onPress={isDownloading ? () => {} : startDownload}>
      {!isDownloading && (
        <MaterialIcons name="cloud-download" size={30} color="white" />
      )}
      {isDownloading && (
        <View style={[styles.button, { width: size, height: size }]}>
          <Svg width={size} height={size}>
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 2}
              stroke={"#ffffff"}
              strokeWidth="2"
              fill="none"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>

          <View style={styles.icon}>
            <View style={styles.stopIcon} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    position: "absolute",
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  stopIcon: {
    width: 10,
    height: 10,
    backgroundColor: "#ffffff",
  },
});

export default DownloadImageButton;
