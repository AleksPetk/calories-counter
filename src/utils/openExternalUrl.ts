import { Alert } from 'react-native';
import * as Linking from 'expo-linking';

/**
 * Opens an https or mailto URL via Expo Linking.
 * Fails gracefully with an alert when the URL cannot be opened.
 */
export async function openExternalUrl(
  url: string,
  label = 'link',
): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed) {
    Alert.alert('Unable to open', `No ${label} is configured.`);
    return;
  }

  try {
    const canOpen = await Linking.canOpenURL(trimmed);
    if (!canOpen) {
      Alert.alert('Unable to open', `Could not open ${label}.`);
      return;
    }
    await Linking.openURL(trimmed);
  } catch {
    Alert.alert('Unable to open', `Could not open ${label}.`);
  }
}
