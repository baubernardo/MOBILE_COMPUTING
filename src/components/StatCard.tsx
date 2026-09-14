import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'success' | 'warning' | 'purple' | 'gold';
  onPress?: () => void;
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'primary',
  onPress,
  compact = false,
}) => {
  let accentColor = Colors.primary;
  let bgGradient = Colors.primaryMuted;

  switch (variant) {
    case 'success':
      accentColor = Colors.success;
      bgGradient = Colors.successMuted;
      break;
    case 'warning':
      accentColor = Colors.warning;
      bgGradient = Colors.warningMuted;
      break;
    case 'purple':
      accentColor = Colors.purple;
      bgGradient = Colors.purpleMuted;
      break;
    case 'gold':
      accentColor = Colors.gold;
      bgGradient = Colors.goldMuted;
      break;
  }

  const Content = (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={[styles.iconContainer, { backgroundColor: bgGradient }]}>
          <Ionicons name={icon} size={compact ? 16 : 20} color={accentColor} />
        </View>
      </View>
      <Text style={[styles.value, { color: accentColor }, compact && styles.compactValue]}>
        {value}
      </Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 140,
    flex: 1,
  },
  compactContainer: {
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  compactValue: {
    fontSize: 17,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
});
