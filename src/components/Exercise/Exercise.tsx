import React, { FC, useCallback, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import KeepAwake from "react-native-keep-awake";
import { useAppContext } from "../../context/AppContext";
import { animate } from "../../utils/animate";
import { buttonAnimatorContentHeight } from "../ButtonAnimator/ButtonAnimator";
import { ExerciseSections } from "./ExerciseSections";
import { ExerciseComplete } from "./ExerciseComplete";
import { ExerciseInterlude } from "./ExerciseInterlude";
import { ExerciseTimer } from "./ExerciseTimer";
import { useOnMount } from "../../hooks/useOnMount";
import { initializeAudio, releaseAudio, playSound } from "../../services/sound";

type Status = "interlude" | "running" | "completed";

type Props = {};

const unmountAnimDuration = 300;

export const Exercise: FC<Props> = () => {
  const {
    technique,
    timerDuration,
    guidedBreathingMode,
    stepVibrationFlag,
  } = useAppContext();
  const [status, setStatus] = useState<Status>("interlude");
  const [unmountContentAnimVal] = useState(new Animated.Value(1));
  const isInfinite = !technique.sections.find((s) => s.repeat > 0);

  const unmountContentAnimation = animate(unmountContentAnimVal, {
    toValue: 0,
    duration: unmountAnimDuration,
  });

  useOnMount(() => {
    if (guidedBreathingMode !== "disabled") initializeAudio();
    return () => {
      if (guidedBreathingMode !== "disabled") releaseAudio();
    };
  });

  const handleInterludeComplete = () => {
    setStatus("running");
  };

  const handleTimeLimitReached = useCallback(() => {
    unmountContentAnimation.start(({ finished }) => {
      if (finished) {
        if (guidedBreathingMode !== "disabled") playSound("endingBell");
        setStatus("completed");
      }
    });
  }, [guidedBreathingMode, unmountContentAnimation]);

  const contentAnimatedStyle = {
    opacity: unmountContentAnimVal,
  };

  return (
    <View style={styles.container}>
      {status === "interlude" && (
        <ExerciseInterlude onComplete={handleInterludeComplete} />
      )}
      {status === "running" && (
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          {isInfinite ? (
            <ExerciseTimer
              limit={timerDuration}
              onLimitReached={handleTimeLimitReached}
            />
          ) : null}
          <ExerciseSections
            sections={technique.sections}
            onComplete={handleTimeLimitReached}
            guidedBreathingMode={guidedBreathingMode}
            vibrationEnabled={stepVibrationFlag}
          />
        </Animated.View>
      )}
      {status === "completed" && <ExerciseComplete />}
      <KeepAwake />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: buttonAnimatorContentHeight,
  },
  content: {
    height: buttonAnimatorContentHeight,
  },
});
