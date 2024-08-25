import { Stack } from "expo-router";

import { useColorScheme } from "@/hooks/useColorScheme";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";

export default function TabLayout() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const isGrantedPermission = (): boolean => {
    return permissionResponse?.status == "granted";
  };
  const colorScheme = useColorScheme();
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
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
