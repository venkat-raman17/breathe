/**
 * Composition root. SettingsProvider boots (DB+seed+settings+i18n+theme registry) and gates `ready`;
 * it sits above i18n, accessibility, and theme because they all read from it.
 */
import { type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n from '@/i18n';
import { AppThemeProvider } from '@/theme/ThemeProvider';
import { A11yProvider } from './A11yProvider';
import { SettingsProvider } from './SettingsProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <I18nextProvider i18n={i18n}>
            <A11yProvider>
              <AppThemeProvider>{children}</AppThemeProvider>
            </A11yProvider>
          </I18nextProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
