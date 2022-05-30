import notifee, { RepeatFrequency, TriggerType } from "@notifee/react-native";

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
