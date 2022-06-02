import React, { FC, useCallback, useEffect, useState, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { buildExerciseSteps } from "../../utils/buildExerciseSteps";
import { fontMono } from "../../config/fonts";
import { ExerciseCircle } from "./ExerciseCircle";

import type { GuidedBreathingMode } from "../../types/GuidedBreathingMode";
import type { TechniqueSection } from "../../types/Technique";

type Props = {
  onComplete: () => void;
  sections: TechniqueSection[];
  guidedBreathingMode: GuidedBreathingMode;
  vibrationEnabled: boolean;
};

export const ExerciseSections: FC<Props> = ({
  onComplete,
  sections,
  guidedBreathingMode,
  vibrationEnabled,
}) => {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [iterations, setIteration] = useState(0);
  const section = sections[sectionIndex];
  const steps = useMemo(
    () => buildExerciseSteps(section.durations).filter((s) => !s.skipped),
    [section]
  );

  const onSectionComplete = useCallback(() => {
    setIteration(iterations + 1);
  }, [iterations]);

  useEffect(() => {
    const section = sections[sectionIndex];
    if (section.repeat && iterations > section.repeat) {
      if (sectionIndex + 1 < sections.length) {
        setIteration(0);
        setSectionIndex(sectionIndex + 1);
      } else {
        onComplete();
      }
    }
  }, [sections, onComplete, sectionIndex, iterations]);

  return (
    <View style={styles.container}>
      <Text style={[styles.durationsText]}>
        {section.durations.join(" - ")}
        {section.repeat > 1 ? ` - ${iterations} / ${section.repeat}` : null}
      </Text>
      {section.manual ? (
        <Text style={[styles.manualText]}>Press and hold during inhale</Text>
      ) : null}
      <ExerciseCircle
        steps={steps}
        manualBreath={Boolean(section.manual)}
        onComplete={onSectionComplete}
        guidedBreathingMode={guidedBreathingMode}
        vibrationEnabled={vibrationEnabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  durationsText: {
    color: "white",
    fontSize: 30,
    marginTop: 32,
    ...fontMono,
  },
  manualText: {
    color: "white",
    fontSize: 18,
    marginBottom: 12,
    ...fontMono,
  },
});
