import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { openDb } from '@/db/client';
import { AppProviders } from '@/providers/AppProviders';

export default function RootLayout() {
  useEffect(() => {
    // Initialize the offline database (open + run migrations) once at startup.
    openDb().catch((err) => console.warn('[breathe] DB init failed', err));
  }, []);

  return (
    <AppProviders>
      <ThemeProvider value={DarkTheme}>
        <StatusBar style="light" />
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0E0B16' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="session/[templateId]"
            options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
          />
          <Stack.Screen name="session/complete" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="safety-gate/[techniqueId]"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="modal/disclaimer"
            options={{ presentation: 'modal', headerShown: true, title: 'About Breathe' }}
          />
          <Stack.Screen
            name="modal/glossary"
            options={{ presentation: 'modal', headerShown: true, title: 'Glossary' }}
          />
          <Stack.Screen name="traditions/[slug]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen
            name="explore/technique/[slug]"
            options={{ headerShown: true, title: '' }}
          />
        </Stack>
      </ThemeProvider>
    </AppProviders>
  );
}
