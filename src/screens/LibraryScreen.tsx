import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LibraryItemCard } from '../components/LibraryItemCard';
import { Screen } from '../components/Screen';
import { SearchField } from '../components/SearchField';
import { SectionHeader } from '../components/SectionHeader';
import type { LibraryListItem } from '../types';
import { colors, gradients } from '../theme/colors';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type LibraryTab = 'foods' | 'meals';

const EMPTY_LIBRARY: LibraryListItem[] = [];

function matchesQuery(name: string, query: string) {
  return name.toLowerCase().includes(query.trim().toLowerCase());
}

export function LibraryScreen() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<LibraryTab>('foods');

  const kind = tab === 'foods' ? 'food' : 'meal';
  const items = EMPTY_LIBRARY.filter((item) => {
    if (item.kind !== kind) {
      return false;
    }
    if (!search.trim()) {
      return true;
    }
    return matchesQuery(item.name, search);
  });

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addPressed]}
          accessibilityRole="button"
          accessibilityLabel="Add"
        >
          <LinearGradient
            colors={[...gradients.buttonAccent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addGradient}
          >
            <Ionicons name="add" size={26} color={colors.textOnAccent} />
          </LinearGradient>
        </Pressable>
      </View>

      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Search foods and meals"
      />

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('foods')}
          style={[styles.tab, tab === 'foods' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'foods' && styles.tabTextActive]}>
            Foods
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('meals')}
          style={[styles.tab, tab === 'meals' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'meals' && styles.tabTextActive]}>
            Meals
          </Text>
        </Pressable>
      </View>

      <SectionHeader title={tab === 'foods' ? 'Foods' : 'Meals'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        {items.map((item) => (
          <LibraryItemCard key={item.id} item={item} />
        ))}
        <Text style={styles.empty}>No items yet</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  addButton: {
    borderRadius: radii.pill,
    overflow: 'hidden',
    ...shadows.button,
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
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: 4,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
