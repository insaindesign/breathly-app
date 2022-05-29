import React, { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { fontMono, fontLight } from "../../config/fonts";
import { Stepper } from "./Stepper";
import { customDurationLimits } from "../../config/customDurationLimits";
import { steps } from "../../config/steps";

import type { TechniqueSection } from "../../types/Technique";
import { plural } from "../../utils/plural";

interface Props {
  sections: TechniqueSection[];
}

export const TechniquePickerItemCustomization: FC<Props> = ({ sections }) => {
  const { theme, updateCustomPatternSection } = useAppContext();
  return (
    <View style={styles.container}>
      {sections.map(({ durations }, sectionIndex) => (
        <View key={sectionIndex} style={styles.divider}>
          {steps.map(({ id, label }, index) => (
            <View key={id} style={styles.item}>
              <View style={styles.left}>
                <Text style={[styles.title, { color: theme.textColor }]}>
                  {label}
                </Text>
                <Text style={[styles.subtitle, { color: theme.textColor }]}>
                  {plural(durations[index], "second", "seconds")}
                </Text>
              </View>
              <Stepper
                onPress={(value: number) =>
                  updateCustomPatternSection(sectionIndex, index, value)
                }
                leftDisabled={
                  durations[index] <= customDurationLimits[index][0]
                }
                rightDisabled={
                  durations[index] >= customDurationLimits[index][1]
                }
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    marginTop: 28,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  divider: {
    marginVertical: 24,
  },
  left: {},
  title: {
    fontSize: 22,
    ...fontLight,
  },
  subtitle: {
    fontSize: 20,
    ...fontMono,
  },
});
