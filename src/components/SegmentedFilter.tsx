import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';

export interface FilterTabOption<T = string> {
  id: T;
  label: string;
  count?: number;
}

interface SegmentedFilterProps<T = string> {
  options: FilterTabOption<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
  scrollable?: boolean;
}

export function SegmentedFilter<T extends string>({
  options,
  selectedId,
  onSelect,
  scrollable = false,
}: SegmentedFilterProps<T>) {
  const renderItem = (option: FilterTabOption<T>) => {
    const isSelected = selectedId === option.id;
    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.tab, isSelected && styles.tabActive]}
        onPress={() => onSelect(option.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
          {option.label}
        </Text>
        {option.count !== undefined && (
          <View style={[styles.countBadge, isSelected && styles.countBadgeActive]}>
            <Text style={[styles.countText, isSelected && styles.countTextActive]}>
              {option.count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {options.map(renderItem)}
      </ScrollView>
    );
  }

  return <View style={styles.container}>{options.map(renderItem)}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countBadgeActive: {
    backgroundColor: Colors.primaryMuted,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  countTextActive: {
    color: Colors.primaryLight,
  },
});
