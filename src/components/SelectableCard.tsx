import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface SelectableCardProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  borderColor?: string;
  selectedBg?: string;
  style?: ViewStyle;
  labelStyle?: object;
  tall?: boolean;
}

export default function SelectableCard({
  label,
  selected,
  onPress,
  borderColor = Colors.primary,
  selectedBg,
  style,
  labelStyle,
  tall = false,
}: SelectableCardProps) {
  const bg = selected ? (selectedBg ?? Colors.primaryLight) : Colors.white;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        tall && styles.tall,
        { borderColor, backgroundColor: bg },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.label, { color: borderColor }, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    minHeight: 70,
  },
  tall: {
    minHeight: 120,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
