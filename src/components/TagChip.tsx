import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface TagChipProps {
  label: string;
  color?: string;
  textColor?: string;
}

export default function TagChip({ label, color = Colors.tagDark, textColor = Colors.white }: TagChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor: color }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 3,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
