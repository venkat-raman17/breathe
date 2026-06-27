import { Stack, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/screen';
import { TechniqueDetail } from '@/components/technique-detail';

export default function TraditionPracticeScreen() {
  const { techniqueSlug } = useLocalSearchParams<{ slug: string; techniqueSlug: string }>();

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: '' }} />
      <TechniqueDetail slug={techniqueSlug ?? ''} />
    </Screen>
  );
}
