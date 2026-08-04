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
import {
  ReferenceCategoryPicker,
  referenceCategoryLabel,
} from '../components/ReferenceCategoryPicker';
import { ReferenceFoodCard } from '../components/ReferenceFoodCard';
import { Screen } from '../components/Screen';
import { SearchField } from '../components/SearchField';
import { useData } from '../data/DataProvider';
import {
  filterReferenceFoods,
  getAllReferenceFoods,
  getReferenceAttribution,
  type ReferenceCategory,
} from '../data/reference';
import { useEntitlement } from '../entitlement';
import { deletePersistedLibraryImage } from '../data/images/libraryImages';
import { canPinAnotherItem } from '../data/library/pinLimit';
import { LibraryStackParamList } from '../navigation/types';
import type { LibraryListItem } from '../types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

type LibrarySegment = 'mine' | 'reference';

function matchesQuery(name: string, query: string) {
  return name.toLowerCase().includes(query.trim().toLowerCase());
}

export function LibraryScreen() {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<LibraryStackParamList>>();
  const { repositories, ready, revision, refresh } = useData();
  const { requireWriteAccess } = useEntitlement();
  const [segment, setSegment] = useState<LibrarySegment>('mine');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ReferenceCategory | null>(null);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [items, setItems] = useState<LibraryListItem[]>([]);
  const referenceFoods = useMemo(() => getAllReferenceFoods(), []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
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
        segments: {
          flexDirection: 'row',
          backgroundColor: theme.elevatedSurface,
          borderRadius: radii.lg,
          padding: 4,
          marginBottom: spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
        },
        segment: {
          flex: 1,
          minHeight: 40,
          borderRadius: radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.sm,
        },
        segmentActive: {
          backgroundColor: theme.surface,
          ...theme.softShadow,
        },
        segmentLabel: {
          ...typography.caption,
          color: theme.textSecondary,
          fontWeight: '600',
          textAlign: 'center',
        },
        segmentLabelActive: {
          color: theme.textPrimary,
          fontWeight: '700',
        },
        categoryRow: {
          marginTop: spacing.sm,
          minHeight: 52,
          borderRadius: radii.lg,
          backgroundColor: theme.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          paddingHorizontal: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...theme.softShadow,
        },
        categoryRowPressed: {
          backgroundColor: theme.elevatedSurface,
        },
        categoryLabel: {
          ...typography.body,
          color: theme.textPrimary,
        },
        categoryRight: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          flexShrink: 1,
        },
        categoryValue: {
          ...typography.caption,
          color: theme.textSecondary,
          maxWidth: 160,
          textAlign: 'right',
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
        attribution: {
          ...typography.micro,
          color: theme.textMuted,
          textAlign: 'center',
          marginTop: spacing.md,
          lineHeight: 16,
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

  const visibleMine = !search.trim()
    ? items
    : items.filter((item) => matchesQuery(item.name, search));

  const visibleReference = useMemo(
    () =>
      filterReferenceFoods(referenceFoods, {
        query: search,
        category,
      }),
    [referenceFoods, search, category],
  );

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

  const categoryValue = referenceCategoryLabel(category);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        {segment === 'mine' ? (
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
        ) : (
          <View style={{ width: 46, height: 46 }} />
        )}
      </View>

      <View style={styles.segments}>
        <Pressable
          style={[styles.segment, segment === 'mine' && styles.segmentActive]}
          onPress={() => setSegment('mine')}
          accessibilityRole="button"
          accessibilityState={{ selected: segment === 'mine' }}
        >
          <Text
            style={[
              styles.segmentLabel,
              segment === 'mine' && styles.segmentLabelActive,
            ]}
          >
            My Library
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.segment,
            segment === 'reference' && styles.segmentActive,
          ]}
          onPress={() => setSegment('reference')}
          accessibilityRole="button"
          accessibilityState={{ selected: segment === 'reference' }}
        >
          <Text
            style={[
              styles.segmentLabel,
              segment === 'reference' && styles.segmentLabelActive,
            ]}
            numberOfLines={1}
          >
            QuickCal Reference
          </Text>
        </Pressable>
      </View>

      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={
          segment === 'mine' ? 'Search library' : 'Search reference foods'
        }
      />

      {segment === 'reference' ? (
        <Pressable
          onPress={() => setCategoryPickerOpen(true)}
          style={({ pressed }) => [
            styles.categoryRow,
            pressed && styles.categoryRowPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Category, ${categoryValue}`}
          accessibilityHint="Opens category filter"
        >
          <Text style={styles.categoryLabel}>Category</Text>
          <View style={styles.categoryRight}>
            <Text style={styles.categoryValue} numberOfLines={1}>
              {categoryValue}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />
          </View>
        </Pressable>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        {segment === 'mine' ? (
          <>
            {!ready ? <Text style={styles.empty}>Loading…</Text> : null}
            {ready &&
              visibleMine.map((item) => (
                <LibraryItemCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    navigation.navigate('LibraryItemEditor', {
                      itemId: item.id,
                    })
                  }
                  onPressPin={() => togglePin(item)}
                  onLongPress={() => confirmDelete(item)}
                />
              ))}
            {ready && visibleMine.length === 0 ? (
              <Text style={styles.empty}>
                {search.trim()
                  ? 'No matches'
                  : 'Tap + to add your first item'}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            {visibleReference.map((item) => (
              <ReferenceFoodCard
                key={item.id}
                item={item}
                onCopy={() => {
                  if (!requireWriteAccess()) {
                    return;
                  }
                  navigation.navigate('ReferenceCopy', {
                    referenceId: item.id,
                  });
                }}
              />
            ))}
            {visibleReference.length === 0 ? (
              <Text style={styles.empty}>
                {search.trim() || category
                  ? 'No matching reference foods'
                  : 'No reference foods'}
              </Text>
            ) : null}
            <Text style={styles.attribution}>{getReferenceAttribution()}</Text>
          </>
        )}
      </ScrollView>

      <ReferenceCategoryPicker
        visible={categoryPickerOpen}
        selected={category}
        onSelect={setCategory}
        onClose={() => setCategoryPickerOpen(false)}
      />
    </Screen>
  );
}
