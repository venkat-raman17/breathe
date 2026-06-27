import { DisclaimerBody } from '@/components/disclaimer-body';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';

export default function DisclaimerModal() {
  return (
    <Screen>
      <AppText variant="title">About Breathe</AppText>
      <DisclaimerBody />
    </Screen>
  );
}
