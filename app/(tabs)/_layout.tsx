import { Tabs } from "expo-router";

import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
export default function TabLayout() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const isGrantedPermission = (): boolean => {
    return permissionResponse?.status == "granted";
  };
  const [isAuthorized, setIsAuthorized] = useState(isGrantedPermission);

  const handlePermissionRequest = async () => {
    const result = await requestPermission();

    if (result.granted) {
      setIsAuthorized(true);
      return;
    }
    handlePermissionRequest();
  };

  useEffect(() => {
    if (isAuthorized) {
      return;
    }
    handlePermissionRequest();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RootSiblingParent>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "rgba(190, 18, 60, 1)",
            tabBarInactiveTintColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => (
                <Entypo name="youtube" size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="whatsApp-status"
            options={{
              title: "WhatsApp Status",
              tabBarIcon: ({ color }) => (
                <Feather name="message-circle" size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="download"
            options={{
              title: "Download",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="history" size={24} color={color} />
              ),
            }}
          />
        </Tabs>
      </RootSiblingParent>
    </SafeAreaView>
  );
}
