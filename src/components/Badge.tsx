import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { getBatteryColor } from '../utils/formatters';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'primary' | 'purple' | 'gold' | 'muted' | 'battery';
  value?: number; // for battery
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  value,
  size = 'sm',
}) => {
  let bg = Colors.primaryMuted;
  let text = Colors.primaryLight;
  let iconName: keyof typeof Ionicons.glyphMap | undefined;

  if (variant === 'battery' && value !== undefined) {
    const color = getBatteryColor(value);
    bg = value >= 90 ? Colors.successMuted : value >= 80 ? Colors.warningMuted : Colors.dangerMuted;
    text = color;
    iconName = 'battery-charging';
  } else if (variant === 'success') {
    bg = Colors.successMuted;
    text = Colors.success;
  } else if (variant === 'warning') {
    bg = Colors.warningMuted;
    text = Colors.warning;
  } else if (variant === 'danger') {
    bg = Colors.dangerMuted;
    text = Colors.danger;
  } else if (variant === 'purple') {
    bg = Colors.purpleMuted;
    text = Colors.purple;
  } else if (variant === 'gold') {
    bg = Colors.goldMuted;
    text = Colors.gold;
  } else if (variant === 'muted') {
    bg = 'rgba(100, 116, 139, 0.2)';
    text = Colors.textSecondary;
  }

  const isSmall = size === 'sm';

  return (
    <View style={[styles.container, { backgroundColor: bg }, isSmall ? styles.smPad : styles.mdPad]}>
      {iconName && (
        <Ionicons
          name={iconName}
          size={isSmall ? 11 : 14}
          color={text}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, { color: text }, isSmall ? styles.smText : styles.mdText]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  smPad: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  mdPad: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  smText: {
    fontSize: 11,
  },
  mdText: {
    fontSize: 13,
  },
});
