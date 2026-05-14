import React, { useState } from 'react';
import { View, Text, StyleSheet, GestureResponderEvent, Platform } from 'react-native';
import { Colors } from '../constants/colors';

interface GaugeDialProps {
  steps: string[];
  currentIndex: number;
  onChange: (index: number) => void;
}

const THUMB_SIZE = 28;

export default function GaugeDial({ steps, currentIndex, onChange }: GaugeDialProps) {
  const [trackWidth, setTrackWidth] = useState(0);

  const norm = steps.length > 1 ? currentIndex / (steps.length - 1) : 0;
  const thumbLeft = norm * (trackWidth - THUMB_SIZE);

  const handleGrant = (evt: GestureResponderEvent) => {
    if (trackWidth === 0) return;
    const x = Math.max(0, Math.min(trackWidth, evt.nativeEvent.locationX));
    const index = Math.round((x / trackWidth) * (steps.length - 1));
    onChange(Math.max(0, Math.min(steps.length - 1, index)));
  };

  const handleMove = (evt: GestureResponderEvent) => {
    if (trackWidth === 0) return;
    const x = Math.max(0, Math.min(trackWidth, evt.nativeEvent.locationX));
    const stepWidth = trackWidth / (steps.length - 1);
    const raw = x / stepWidth;
    const lower = Math.floor(raw);
    const frac = raw - lower;

    // Dead zone: only snap to an adjacent step once the touch has crossed
    // 35% past the midpoint, preventing oscillation near step boundaries.
    let newIndex: number;
    if (frac < 0.35) {
      newIndex = lower;
    } else if (frac > 0.65) {
      newIndex = lower + 1;
    } else {
      newIndex = currentIndex;
    }

    onChange(Math.max(0, Math.min(steps.length - 1, newIndex)));
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelsRow}>
        <Text style={styles.edgeLabel}>{steps[0]}</Text>
        <Text style={styles.edgeLabel}>{steps[steps.length - 1]}</Text>
      </View>

      <View
        style={styles.trackContainer}
        onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleGrant}
        onResponderMove={handleMove}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${norm * 100}%` as any }]} />
        </View>
        {trackWidth > 0 && (
          <View style={[styles.thumb, { left: thumbLeft }]} />
        )}
      </View>

      <Text style={styles.valueLabel}>{steps[currentIndex] || ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  edgeLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  trackContainer: {
    width: '100%',
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gaugeTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.primary,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    top: 0,
  },
  valueLabel: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginTop: 12,
    letterSpacing: 0.5,
  },
});
