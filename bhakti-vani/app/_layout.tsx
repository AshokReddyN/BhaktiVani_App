import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { SplashScreen, Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts, Lexend_400Regular, Lexend_500Medium, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { NotoSansTelugu_400Regular, NotoSansTelugu_500Medium, NotoSansTelugu_700Bold } from '@expo-google-fonts/noto-sans-telugu';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

import { ThemeProvider as CustomThemeProvider, useTheme } from '../src/context/ThemeContext';

function Root() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { theme, toggleTheme } = useTheme();
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_700Bold,
    NotoSansTelugu_400Regular,
    NotoSansTelugu_500Medium,
    NotoSansTelugu_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: 'భక్తి వాణి',
              headerRight: () => (
                <Pressable onPress={toggleColorScheme} style={{ padding: 8 }}>
                  <MaterialIcons
                    name={colorScheme === 'dark' ? 'light-mode' : 'dark-mode'}
                    size={24}
                    color={colorScheme === 'dark' ? 'white' : 'black'}
                  />
                </Pressable>
              ),
            }}
          />
          <Stack.Screen name="stotras" options={{ title: 'Stotras' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <Root />
    </CustomThemeProvider>
  );
}
