import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

function MarqueeComponent({
  speed = 6,
  space = 50,
  content,
  textStyle,
  containerStyle,
  alwayAnimate = false,
}) {
  const transTextValue = useSharedValue(0);
  const transTextDupValue = useSharedValue(0);
  const [size, setSize] = useState(0);
  const [txtSize, setTxtSize] = useState(0);
  const isTextOverFlow = size > 0 && txtSize > 0 && txtSize - space > size;

  useEffect(() => {
    resetAnimate();
  }, [content]);

  useEffect(() => {
    if (alwayAnimate || isTextOverFlow) {
      setTimeout(() => {
        runAnimate();
      }, 1000);
    }
  }, [txtSize, size]);

  function resetAnimate() {
    cancelAnimation(transTextValue);
    cancelAnimation(transTextDupValue);
    transTextValue.value = 0;
    transTextDupValue.value = 0;
  }

  function runAnimate() {
    const v = txtSize / (speed * 10);
    const time_t = v * 2 * 1000;

    transTextValue.value = withSequence(
      withTiming(-txtSize, { duration: v * 1000, easing: Easing.linear }),
      withTiming(txtSize, { duration: -1 }),
      withRepeat(
        withSequence(
          withTiming(-txtSize, {
            duration: time_t,
            easing: Easing.linear,
          }),
          withTiming(txtSize, { duration: -1 })
        ),
        -1
      )
    );
  }

  useAnimatedReaction(
    () => transTextValue.value,
    (res, old_res) => {
      if (res < 0) {
        transTextDupValue.value = res;
      } else if (old_res > 0) {
        const change = old_res - res;
        transTextDupValue.value -= change;
      }
    }
  );

  const txtAnimate = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: transTextValue.value }],
    };
  });
  const txtAnimateDup = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: transTextDupValue.value }],
    };
  });

  return (
    <ScrollView
      horizontal
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      onLayout={(e) => {
        console.log(e.nativeEvent.layout);
        setSize(e.nativeEvent.layout.width);
      }}
      contentContainerStyle={containerStyle}
    >
      <Animated.Text
        style={[textStyle, { paddingRight: space }, txtAnimate]}
        onLayout={(e) => {
          setTxtSize(e.nativeEvent.layout.width);
        }}
      >
        {content}
      </Animated.Text>
      {(alwayAnimate || isTextOverFlow) && (
        <Animated.Text
          style={[textStyle, { paddingRight: space }, txtAnimateDup]}
        >
          {content}
        </Animated.Text>
      )}
    </ScrollView>
  );
}

export const Marquee = React.memo(MarqueeComponent, (prv, next) => {
  prv.content === next.content;
});
