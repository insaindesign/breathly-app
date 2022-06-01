import React, { FC, useEffect } from "react";
import { StyleSheet, LayoutAnimation, ScrollView } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { PageContainer } from "../PageContainer/PageContainer";
import { SettingsItemSwitch } from "./SettingsItemSwitch";
import { SettingsSection } from "./SettingsSection";
import { SettingsItemRadio } from "./SettingsItemRadio";
import { GuidedBreathingMode } from "../../types/GuidedBreathingMode";
import { SettingsItemMinutesInput } from "./SettingsItemMinutesInput";
import { SettingsItemClockInput } from "./SettingsItemClockInput";
import {
  checkBatteryOptimisation,
  checkPowerOptimisation,
} from "../../services/notification";

interface Props {
  visible: boolean;
  onHide: () => void;
  onBackButtonPress: () => void;
}

export const Settings: FC<Props> = ({ visible, onHide, onBackButtonPress }) => {
  const {
    theme,
    systemColorScheme,
    customDarkModeFlag,
    guidedBreathingMode,
    timerDuration,
    notification,
    toggleTimer,
    setTimerDuration,
    stepVibrationFlag,
    followSystemDarkModeFlag,
    toggleCustomDarkMode,
    toggleFollowSystemDarkMode,
    setGuidedBreathingMode,
    setNotification,
    toggleStepVibration,
  } = useAppContext();

  const guidedBreathingItems: {
    value: GuidedBreathingMode;
    label: string;
  }[] = [
    { value: "disabled", label: "Disabled" },
    { value: "laura", label: "Laura's voice" },
    { value: "paul", label: "Paul's voice" },
    { value: "bell", label: "Bell cue" },
  ];

  useEffect(() => {
    if (!notification) {
      return;
    }
    const disable = () => setNotification(null);
    checkPowerOptimisation(disable).then((power) => {
      if (power) {
        checkBatteryOptimisation(disable);
      }
    });
  }, [notification, setNotification]);

  return (
    <PageContainer
      title="Settings"
      visible={visible}
      onBackButtonPress={onBackButtonPress}
      onHide={onHide}
    >
      <ScrollView style={styles.content}>
        <SettingsSection label={"Dark mode"}>
          {systemColorScheme !== "no-preference" && (
            <SettingsItemSwitch
              label="Follow system settings"
              color={theme.mainColor}
              value={followSystemDarkModeFlag}
              onValueChange={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                toggleFollowSystemDarkMode();
              }}
            />
          )}
          {(systemColorScheme === "no-preference" ||
            !followSystemDarkModeFlag) && (
            <SettingsItemSwitch
              label="Use dark mode"
              color={theme.mainColor}
              value={customDarkModeFlag}
              onValueChange={toggleCustomDarkMode}
            />
          )}
        </SettingsSection>
        <SettingsSection label={"Timer"}>
          <SettingsItemSwitch
            label="Enable excercise timer"
            color={theme.mainColor}
            value={!!timerDuration}
            onValueChange={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              toggleTimer();
            }}
          />
          {!!timerDuration && (
            <SettingsItemMinutesInput
              label="Timer duration (minutes)"
              color={theme.mainColor}
              value={timerDuration}
              onValueChange={(value) => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                setTimerDuration(value);
              }}
            />
          )}
        </SettingsSection>
        <SettingsSection label={"Notifications"}>
          <SettingsItemSwitch
            label="Enable daily reminder"
            color={theme.mainColor}
            value={notification !== null}
            onValueChange={(val) => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setNotification(val ? 450 : null);
            }}
          />
          {notification !== null ? (
            <SettingsItemClockInput
              label="Reminder time"
              value={notification}
              onValueChange={(value) => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                setNotification(value);
              }}
            />
          ) : null}
        </SettingsSection>
        <SettingsSection label={"Vibration"}>
          <SettingsItemSwitch
            label="Vibrate on step change"
            color={theme.mainColor}
            value={stepVibrationFlag}
            onValueChange={toggleStepVibration}
          />
        </SettingsSection>
        <SettingsSection label={"Guided Breathing"}>
          {guidedBreathingItems.map(({ label, value }, index) => (
            <SettingsItemRadio
              key={value}
              index={index}
              label={label}
              color={theme.mainColor}
              selected={value === guidedBreathingMode}
              onPress={() => setGuidedBreathingMode(value)}
            />
          ))}
        </SettingsSection>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 36,
    marginVertical: 12,
  },
});
