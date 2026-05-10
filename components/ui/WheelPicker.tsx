import React, { useRef, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface WheelPickerProps {
  data: string[];
  selected: string;
  onSelect: (value: string) => void;
  label: string;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  data,
  selected,
  onSelect,
  label,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const isInitialScroll = useRef(true);

  // Scroll to selected only on mount or when visibility changes
  const handleLayout = useCallback(() => {
    if (isInitialScroll.current) {
      const index = data.indexOf(selected);
      if (index >= 0 && scrollRef.current) {
        scrollRef.current.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
        isInitialScroll.current = false;
      }
    }
  }, [selected, data]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    
    // Only call onSelect if the index actually changed to avoid loops
    if (data[clampedIndex] !== selected) {
      onSelect(data[clampedIndex]);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      {/* Label */}
      <Text
        style={{
          fontFamily: "Inter-Bold",
          color: "#8B949E",
          fontSize: 9,
          letterSpacing: 1.5,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>

      {/* Picker container */}
      <View
        style={{ height: PICKER_HEIGHT, width: "100%", position: "relative" }}
      >
        {/* Selection highlight */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: ITEM_HEIGHT * 2,
            left: 4,
            right: 4,
            height: ITEM_HEIGHT,
            backgroundColor: "#F5E64215",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#F5E64230",
            zIndex: 1,
          }}
        />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          disableIntervalMomentum={true}
          nestedScrollEnabled={true}
          onLayout={handleLayout}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          contentContainerStyle={{
            paddingTop: ITEM_HEIGHT * 2,
            paddingBottom: ITEM_HEIGHT * 2,
          }}
          // Critical: don't let BottomSheet steal touch events
          scrollEventThrottle={16}
        >
          {data.map((item, index) => {
            const isSelected = item === selected;
            const distance = Math.abs(index - data.indexOf(selected));
            const opacity = distance === 0 ? 1 : distance === 1 ? 0.6 : 0.3;

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(item);
                  scrollRef.current?.scrollTo({
                    y: index * ITEM_HEIGHT,
                    animated: true,
                  });
                }}
                style={{
                  height: ITEM_HEIGHT,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: isSelected ? "Inter-Bold" : "Inter",
                    fontSize: isSelected ? 16 : 14,
                    color: isSelected ? "#F5E642" : "white",
                    opacity,
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};
