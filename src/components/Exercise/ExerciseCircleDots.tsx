import React, { FC, useEffect, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import { animate } from "../../utils/animate";
import { interpolateScale } from "../../utils/interpolate";
import { times } from "../../utils/times";

const dotSize = Math.floor(4);
const fadeInAnimDuration = 400;
const duration = fadeInAnimDuration;

type Props = {
  visible?: boolean;
  numberOfDots: number;
  totalDuration: number;
};

export const ExerciseCircleDots: FC<Props> = ({
  visible = false,
  numberOfDots,
  totalDuration,
}) => {
  const [dotAnimVals, setDotAnimVals] = useState<Animated.Value[]>([]);

  useEffect(() => {
    if (!visible) {
      setDotAnimVals([]);
      return;
    }
    const delayDuration = Math.floor(totalDuration / numberOfDots - duration);
    const animVals: Animated.Value[] = [];
    const animations: Animated.CompositeAnimation[] = [];
    times(numberOfDots).forEach(() => {
      const animVal = new Animated.Value(0);
      animVals.push(animVal);
      animations.push(animate(animVal, { toValue: 1, duration }));
      animations.push(Animated.delay(delayDuration));
    });
    setDotAnimVals(animVals);
    const dotsAnimation = Animated.sequence(animations);
    dotsAnimation.start();
    return () => {
      animVals.forEach((val) => val.setValue(0));
      dotsAnimation.stop();
    };
  }, [numberOfDots, visible, totalDuration]);

  return (
    <Animated.View style={[styles.container]}>
      {dotAnimVals.map((val, index) => (
        <Animated.View
          key={`dot_${index}`}
          style={[
            styles.dot,
            {
              opacity: val.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
              transform: [
                interpolateScale(val, {
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              ],
            },
          ]}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    paddingTop: Math.floor(24) * 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: "white",
    margin: dotSize * 0.7,
  },
});
