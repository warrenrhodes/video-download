import { useColorScheme } from "@/hooks/useColorScheme";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { createTheme, ThemeProvider } from "@rneui/themed";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    NerkoOne: require("../assets/fonts/NerkoOne-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const theme = createTheme({
    mode: "dark",
  });

  return (
    <ThemeProvider theme={theme}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, freezeOnBlur: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
