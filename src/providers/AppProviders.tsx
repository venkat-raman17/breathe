/**
 * Composition root for app-wide providers. Order matters: gesture + safe-area shells,
 * then accessibility (so theme can read reduce-motion), then mode, then theme.
 */
import { type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '@/theme/ThemeProvider';
import { A11yProvider } from './A11yProvider';
import { TraditionProvider } from './TraditionProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <A11yProvider>
          <TraditionProvider>
            <AppThemeProvider>{children}</AppThemeProvider>
          </TraditionProvider>
        </A11yProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
