import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
