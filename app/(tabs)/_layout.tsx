import { Tabs } from "expo-router";

import * as MediaLibrary from "expo-media-library";
import { useEffect } from "react";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoSvg } from "@/components/icons/VideoSvg";
import { DownloadIcons } from "@/components/icons/Download";
import { WhatsAppStatus } from "@/components/icons/Whasapp-icon";
import { View } from "react-native";
import { DatabaseProvider } from "@/components/hooks/DatabaseProvider";
import { useThemeMode } from "@rneui/themed";
import { cn } from "@/lib/utils";
export default function TabLayout() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const { mode } = useThemeMode();

  const handlePermissionRequest = async () => {
    if (permissionResponse?.status == "granted") {
      return;
    }
    handlePermissionRequest();
  };

  useEffect(() => {
    if (permissionResponse?.status == "granted") {
      return;
    }
    const handlePermissionRequest = async () => {
      await requestPermission();
    };
    handlePermissionRequest();
  }, []);

  return (
    <DatabaseProvider>
      <SafeAreaView
        style={{ flex: 1 }}
        className={cn(mode === "light" ? "light" : "dark")}
      >
        <RootSiblingParent>
          <View className={cn("flex-1", mode === "light" ? "light" : "dark")}>
            <Tabs
              screenOptions={{
                headerShown: false,
                tabBarActiveTintColor:
                  mode === "light" ? "white" : "rgba(55, 65,81 ,1)",
                tabBarInactiveTintColor: "rgba(55, 65,81 ,0.4)",
                unmountOnBlur: true,
                tabBarStyle: {
                  position: "absolute",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  backgroundColor:
                    mode === "dark" ? "white" : "rgba(61,97,255,0.10);",
                  height: 60,
                  borderTopWidth: 0,
                  zIndex: 10,
                },
              }}
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: "Home",
                  tabBarIcon: ({ color }) => (
                    <VideoSvg size={24} color={color} />
                  ),
                  tabBarLabel: "Home",
                  tabBarLabelStyle: {
                    fontFamily: "NerkoOne",
                    fontSize: 15,
                  },
                }}
              />
              <Tabs.Screen
                name="whatsApp-status"
                options={{
                  title: "WhatsApp Status",
                  tabBarIcon: ({ color }) => (
                    <WhatsAppStatus size={24} color={color} />
                  ),
                  tabBarLabel: "WhatsApp Status",
                  tabBarLabelStyle: {
                    fontFamily: "NerkoOne",
                    fontSize: 15,
                  },
                }}
              />
              <Tabs.Screen
                name="download"
                options={{
                  title: "Download",
                  tabBarIcon: ({ color }) => (
                    <DownloadIcons size={24} color={color} />
                  ),
                  tabBarLabel: "Download",
                  tabBarLabelStyle: {
                    fontFamily: "NerkoOne",
                    fontSize: 15,
                  },
                }}
              />
            </Tabs>
          </View>
        </RootSiblingParent>
      </SafeAreaView>
    </DatabaseProvider>
  );
}
