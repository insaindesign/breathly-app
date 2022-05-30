import { AppRegistry } from "react-native";
import notifee, { EventType } from "@notifee/react-native";

import { App } from "./src/components/App/App";
import { name as appName } from "./app.json";

notifee.onBackgroundEvent(({ type, detail }) => {
  const { notification, pressAction } = detail;
  if (type === EventType.ACTION_PRESS && pressAction.id === "mark-as-read") {
    notifee.cancelNotification(notification.id);
  }
});

AppRegistry.registerComponent(appName, () => App);
