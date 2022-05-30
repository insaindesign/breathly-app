import React, { useCallback, useState } from "react";
import { Animated, Platform, StyleSheet, Text, TextInput } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { fontLight } from "../../config/fonts";

import type { FC } from "react";
import { times } from "../../utils/times";

interface Props {
  label: string;
  value: number;
  color?: string;
  onValueChange: (newValue: number) => void;
}

const padStart = (value: number, places: number, fill: string): string => {
  const size = value.toString().length;
  return (
    times(places - size)
      .map(() => fill)
      .join("") + value
  );
};

const getHour = (minsOffset: number) => {
  return Math.floor(minsOffset / 60);
};

const getMinute = (minsOffset: number) => {
  return minsOffset - getHour(minsOffset) * 60;
};

const convert = {
  from: (val: number): [string, string] => [
    padStart(getHour(val), 2, "0"),
    padStart(getMinute(val), 2, "0"),
  ],
  to: (hr: string, min: string): number =>
    parseInt(hr, 10) * 60 + parseInt(min),
};

export const SettingsItemClockInput: FC<Props> = ({
  label,
  value,
  onValueChange,
}) => {
  const [hr, min] = convert.from(value);
  const [inputHr, setInputHr] = useState(hr);
  const [inputMin, setInputMin] = useState(min);
  const { theme } = useAppContext();

  const onDone = useCallback(() => {
    const newValue = convert.to(inputHr, inputMin);
    if (newValue !== value) {
      onValueChange(newValue);
    }
  }, [onValueChange, inputHr, inputMin, value]);

  const updateInput = useCallback(
    (setter: (s: string) => void, max: number) => (val: string) => {
      const num = Math.min(Math.max(parseInt(val, 10), 0), max);
      setter(padStart(num, 2, "0"));
    },
    []
  );

  return (
    <Animated.View style={styles.container}>
      <Text style={[styles.label, { color: theme.textColor }]}>{label}</Text>
      <Animated.View style={styles.inputs}>
        <TextInput
          value={inputHr}
          onChangeText={updateInput(setInputHr, 23)}
          style={[
            styles.input,
            { color: theme.textColor, borderBottomColor: theme.textColor },
          ]}
          autoCompleteType="off"
          keyboardType="numeric"
          selectionColor={theme.mainColor}
          textContentType="none"
          underlineColorAndroid={theme.textColorLighter}
          blurOnSubmit={true}
          onSubmitEditing={onDone}
          onBlur={onDone}
        />
        <Text>:</Text>
        <TextInput
          value={inputMin}
          onChangeText={updateInput(setInputMin, 59)}
          style={[
            styles.input,
            { color: theme.textColor, borderBottomColor: theme.textColor },
          ]}
          autoCompleteType="off"
          keyboardType="numeric"
          selectionColor={theme.mainColor}
          textContentType="none"
          underlineColorAndroid={theme.textColorLighter}
          blurOnSubmit={true}
          onSubmitEditing={onDone}
          onBlur={onDone}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 8 : 0,
  },
  label: {
    fontSize: 18,
    ...fontLight,
  },
  inputs: {
    fontSize: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontSize: 18,
    ...fontLight,
    textAlign: "right",
    borderBottomWidth: Platform.OS === "ios" ? StyleSheet.hairlineWidth : 0,
  },
});
