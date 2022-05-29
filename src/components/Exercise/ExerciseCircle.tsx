import React, { FC, useCallback, useEffect, useState } from "react";
import { Animated, StyleSheet, Platform, Vibration } from "react-native";
import { deviceWidth } from "../../config/constants";
import { animate } from "../../utils/animate";
import {
  interpolateScale,
  interpolateTranslateY,
} from "../../utils/interpolate";
import { ExerciseCircleDots } from "./ExerciseCircleDots";
import { fontThin } from "../../config/fonts";
import { playSound } from "../../services/sound";
import ReactNativeHaptic from "react-native-haptic";
import { GuidedBreathingMode } from "../../types/GuidedBreathingMode";
import { Step } from "../../types/Step";
import { Touchable } from "../../common/Touchable";

type Props = {
  onComplete: () => void;
  steps: Step[];
  guidedBreathingMode: GuidedBreathingMode;
  vibrationEnabled: boolean;
};

const circleSize = deviceWidth * 0.8;
const fadeInAnimDuration = 400;
const textDuration = fadeInAnimDuration;

export const ExerciseCircle: FC<Props> = ({
  onComplete,
  steps,
  guidedBreathingMode,
  vibrationEnabled,
}) => {
  const [showUpAnimVal] = useState(new Animated.Value(0));
  const [scaleAnimVal] = useState(new Animated.Value(0));
  const [textAnimVal] = useState(new Animated.Value(1));
  const [circleMinAnimVal] = useState(new Animated.Value(0));
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const currentStep =
    currentStepIndex !== null ? steps[currentStepIndex] : null;

  const animateStep = useCallback(
    (id: string, duration: number) => {
      const toValue = id === "inhale" || id === "afterInhale" ? 1 : 0;
      return Animated.stagger(duration - textDuration, [
        Animated.parallel([
          animate(scaleAnimVal, { toValue, duration }),
          animate(circleMinAnimVal, {
            toValue,
            duration: textDuration,
          }),
          animate(textAnimVal, {
            toValue: 1,
            duration: textDuration,
          }),
        ]),
        animate(textAnimVal, {
          toValue: 0,
          duration: textDuration,
        }),
      ]);
    },
    [circleMinAnimVal, scaleAnimVal, textAnimVal]
  );

  const incrementStepIndex = useCallback(() => {
    setCurrentStepIndex(
      currentStepIndex === null ? 0 : (currentStepIndex + 1) % steps.length
    );
  }, [steps, currentStepIndex]);

  useEffect(() => {
    if (currentStepIndex === null) {
      return;
    }
    if (currentStepIndex === 0) {
      onComplete();
    }
    const step = steps[currentStepIndex];
    const animation = animateStep(step.id, step.duration);
    animation.start(({ finished }) => {
      if (finished) {
        setCurrentStepIndex((currentStepIndex + 1) % steps.length);
      }
    });
    if (step.id === "exhale") {
      if (guidedBreathingMode === "laura") playSound("lauraBreatheOut");
      if (guidedBreathingMode === "paul") playSound("paulBreatheOut");
      if (guidedBreathingMode === "bell") playSound("cueBell1");
    } else if (step.id === "inhale") {
      if (guidedBreathingMode === "laura") playSound("lauraBreatheIn");
      if (guidedBreathingMode === "paul") playSound("paulBreatheIn");
      if (guidedBreathingMode === "bell") playSound("cueBell1");
    } else if (step.id === "afterExhale") {
      if (guidedBreathingMode === "laura") playSound("lauraHold");
      if (guidedBreathingMode === "paul") playSound("paulHold");
      if (guidedBreathingMode === "bell") playSound("cueBell2");
    } else if (step.id === "afterInhale") {
      if (guidedBreathingMode === "laura") playSound("lauraHold");
      if (guidedBreathingMode === "paul") playSound("paulHold");
      if (guidedBreathingMode === "bell") playSound("cueBell2");
    }
    if (vibrationEnabled) {
      if (Platform.OS === "ios") {
        ReactNativeHaptic.generate("impactHeavy");
        setTimeout(() => ReactNativeHaptic.generate("impactHeavy"), 100);
      } else if (Platform.OS === "android") {
        Vibration.vibrate(200);
      }
    }
    return () => animation.stop();
    // eslint-disable-next-line react-app/react-hooks/exhaustive-deps
  }, [
    currentStepIndex,
    steps,
    animateStep,
    vibrationEnabled,
    guidedBreathingMode,
  ]);

  useEffect(() => {
    const showUpAnimation = animate(showUpAnimVal, {
      toValue: 1,
      duration: fadeInAnimDuration,
    });
    showUpAnimation.start(({ finished }) => {
      if (finished) {
        setCurrentStepIndex(0);
      }
    });
    return () => showUpAnimation.stop();
  }, [showUpAnimVal]);

  const containerAnimatedStyle = {
    opacity: showUpAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  const circleAnimatedStyle = {
    transform: [
      interpolateScale(scaleAnimVal, {
        inputRange: [0, 1],
        outputRange: [0.6, 1],
      }),
    ],
  };

  const contentAnimatedStyle = {
    opacity: textAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      interpolateScale(scaleAnimVal, {
        inputRange: [0, 1],
        outputRange: [1, 1.3],
      }),
      interpolateTranslateY(textAnimVal, {
        inputRange: [0, 1],
        outputRange: [-8, 0],
      }),
    ],
  };

  const circleMinAnimatedStyle = {
    opacity: circleMinAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <Animated.View style={[styles.circle, circleAnimatedStyle]} />
      <Animated.View style={[styles.circleMin, circleMinAnimatedStyle]} />
      <Touchable onPress={incrementStepIndex} style={styles.circleMax}>
        <Animated.View />
      </Touchable>
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <Animated.Text style={styles.text}>{currentStep?.label}</Animated.Text>
        <ExerciseCircleDots
          visible={currentStep?.showDots}
          numberOfDots={3}
          totalDuration={currentStep?.duration || 0}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "white",
    borderWidth: StyleSheet.hairlineWidth,
  },
  circleMin: {
    position: "absolute",
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    transform: [{ scale: 0.6 }],
  },
  circleMax: {
    position: "absolute",
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  content: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: Math.floor(24),
    textAlign: "center",
    color: "white",
    ...fontThin,
  },
});
