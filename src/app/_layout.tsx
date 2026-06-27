import { DarkTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProviders } from '@/providers/AppProviders';
import { useSettings } from '@/providers/SettingsProvider';

// Hold the native splash until SettingsProvider has booted (DB + seed + i18n + theme registry).
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <AppProviders>
      <ThemeProvider value={DarkTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </ThemeProvider>
    </AppProviders>
  );
}

function RootNavigator() {
  const { ready, onboardingCompleted } = useSettings();
  const router = useRouter();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    if (ready && !onboardingCompleted) router.replace('/onboarding');
  }, [ready, onboardingCompleted, router]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0E0B16' } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen
        name="session/[templateId]"
        options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
      />
      <Stack.Screen name="session/complete" options={{ presentation: 'modal' }} />
      <Stack.Screen name="safety-gate/[techniqueId]" options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="modal/disclaimer"
        options={{ presentation: 'modal', headerShown: true, title: 'About Breathe' }}
      />
      <Stack.Screen
        name="modal/glossary"
        options={{ presentation: 'modal', headerShown: true, title: 'Glossary' }}
      />
      <Stack.Screen name="traditions/[slug]" options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="explore/technique/[slug]" options={{ headerShown: true, title: '' }} />
    </Stack>
  );
}
