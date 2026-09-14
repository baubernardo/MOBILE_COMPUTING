import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  badgeCount?: number;
  rightActionLabel?: string;
  rightActionIcon?: keyof typeof Ionicons.glyphMap;
  onRightAction?: () => void;
  secondaryActionIcon?: keyof typeof Ionicons.glyphMap;
  onSecondaryAction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  badgeCount,
  rightActionLabel,
  rightActionIcon = 'add',
  onRightAction,
  secondaryActionIcon,
  onSecondaryAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {badgeCount !== undefined && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeCount}</Text>
            </View>
          )}
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.rightActions}>
        {secondaryActionIcon && onSecondaryAction && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSecondaryAction}
            activeOpacity={0.7}
          >
            <Ionicons name={secondaryActionIcon} size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {onRightAction && (
          <TouchableOpacity
            style={[styles.primaryButton, rightActionLabel ? styles.labeledButton : styles.iconOnlyButton]}
            onPress={onRightAction}
            activeOpacity={0.8}
          >
            <Ionicons name={rightActionIcon} size={18} color="#FFFFFF" />
            {rightActionLabel && <Text style={styles.primaryButtonText}>{rightActionLabel}</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.background,
  },
  left: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  labeledButton: {
    paddingHorizontal: 14,
    height: 38,
    gap: 4,
  },
  iconOnlyButton: {
    width: 38,
    height: 38,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
