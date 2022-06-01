import { Alert } from "react-native";
import notifee, { RepeatFrequency, TriggerType } from "@notifee/react-native";

export const checkPowerOptimisation = async (disable: () => void) => {
  const powerManagerInfo = await notifee.getPowerManagerInfo();
  if (!powerManagerInfo.activity) {
    return true;
  }
  Alert.alert(
    "Power Restrictions Detected",
    "To ensure notifications are delivered, please adjust your settings to prevent Breathly from being killed",
    [
      {
        text: "OK, open settings",
        onPress: async () => await notifee.openPowerManagerSettings(),
      },
      {
        text: "Cancel",
        onPress: disable,
        style: "cancel",
      },
    ],
    { cancelable: false }
  );
  return false;
};
export const checkBatteryOptimisation = async (disable: () => void) => {
  const batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled();
  if (!batteryOptimizationEnabled) {
    return true;
  }
  Alert.alert(
    "Battery Restrictions Detected",
    "To ensure notifications are delivered, please disable battery optimization for Breathly.",
    [
      {
        text: "OK, open settings",
        onPress: async () => await notifee.openBatteryOptimizationSettings(),
      },
      {
        text: "Cancel",
        onPress: disable,
        style: "cancel",
      },
    ],
    { cancelable: false }
  );
  return false;
};

export const modifyNotifications = async (notifSetting: number | null) => {
  const current = await notifee.getTriggerNotificationIds();
  if (current.length) {
    await notifee.cancelTriggerNotifications();
  }

  if (notifSetting === null) {
    return;
  }

  const date = new Date();
  const hrs = Math.floor(notifSetting / 60);
  const min = notifSetting - hrs * 60;
  date.setHours(hrs, min, 0, 0);
  if (date.getTime() < Date.now()) {
    date.setHours(24, 0, 0, 0);
    date.setHours(hrs, min, 0, 0);
  }

  const channelId = await notifee.createChannel({
    id: "reminders",
    name: "Reminders",
  });

  notifee.createTriggerNotification(
    {
      title: "Reminder to Breathe",
      body: "It's time for your daily breathing exercises",
      android: {
        channelId,
        pressAction: {
          id: "default",
        },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    }
  );
};
