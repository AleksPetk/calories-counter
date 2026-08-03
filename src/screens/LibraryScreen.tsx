import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { LibraryItemCard } from '../components/LibraryItemCard';
import { Screen } from '../components/Screen';
import { SearchField } from '../components/SearchField';
import { useData } from '../data/DataProvider';
import { useEntitlement } from '../entitlement';
import { deletePersistedLibraryImage } from '../data/images/libraryImages';
import { canPinAnotherItem } from '../data/library/pinLimit';
import { LibraryStackParamList } from '../navigation/types';
import type { LibraryListItem } from '../types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

function matchesQuery(name: string, query: string) {
  return name.toLowerCase().includes(query.trim().toLowerCase());
}

export function LibraryScreen() {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<LibraryStackParamList>>();
  const { repositories, ready, revision, refresh } = useData();
  const { requireWriteAccess } = useEntitlement();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<LibraryListItem[]>([]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.lg,
        },
        title: {
          ...typography.title,
          color: theme.textPrimary,
        },
        addButton: {
          borderRadius: radii.pill,
          overflow: 'hidden',
          ...theme.buttonShadow,
        },
        addPressed: {
          opacity: 0.9,
          transform: [{ scale: 0.97 }],
        },
        addGradient: {
          width: 46,
          height: 46,
          alignItems: 'center',
          justifyContent: 'center',
        },
        list: {
          paddingTop: spacing.md,
          paddingBottom: spacing.xxl,
        },
        empty: {
          ...typography.body,
          color: theme.textSecondary,
          textAlign: 'center',
          paddingVertical: spacing.xl,
        },
      }),
    [theme],
  );

  const load = useCallback(async () => {
    if (!repositories) {
      return;
    }
    const all = await repositories.libraryItems.getAll();
    setItems(
      all.map((item) => ({
        id: item.id,
        name: item.name,
        calories: item.calories,
        loggingMode: item.loggingMode,
        pinned: item.pinned,
        image: item.image,
      })),
    );
  }, [repositories, revision]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = !search.trim()
    ? items
    : items.filter((item) => matchesQuery(item.name, search));

  const togglePin = async (item: LibraryListItem) => {
    if (!requireWriteAccess()) {
      return;
    }
    if (!repositories) {
      return;
    }
    if (!item.pinned) {
      const allowed = await canPinAnotherItem(repositories);
      if (!allowed) {
        Alert.alert('Pin limit', 'You can pin up to 21 items.');
        return;
      }
    }
    await repositories.libraryItems.update(item.id, { pinned: !item.pinned });
    refresh();
  };

  const confirmDelete = (item: LibraryListItem) => {
    if (!requireWriteAccess()) {
      return;
    }
    Alert.alert('Delete item?', item.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!repositories) {
            return;
          }
          const existing = await repositories.libraryItems.getById(item.id);
          await repositories.libraryItems.delete(item.id);
          await deletePersistedLibraryImage(existing?.image);
          refresh();
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Pressable
          onPress={() => {
            if (!requireWriteAccess()) {
              return;
            }
            navigation.navigate('LibraryItemEditor', {});
          }}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add item"
        >
          <LinearGradient
            colors={[...theme.gradients.buttonAccent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addGradient}
          >
            <Ionicons name="add" size={26} color={theme.textOnAccent} />
          </LinearGradient>
        </Pressable>
      </View>

      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Search library"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        {!ready ? <Text style={styles.empty}>Loading…</Text> : null}
        {ready &&
          visible.map((item) => (
            <LibraryItemCard
              key={item.id}
              item={item}
              onPress={() =>
                navigation.navigate('LibraryItemEditor', { itemId: item.id })
              }
              onPressPin={() => togglePin(item)}
              onLongPress={() => confirmDelete(item)}
            />
          ))}
        {ready && visible.length === 0 ? (
          <Text style={styles.empty}>
            {search.trim()
              ? 'No matches'
              : 'Tap + to add your first item'}
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
