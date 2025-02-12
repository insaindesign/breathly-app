import React, { FC } from "react";
import { Animated, StyleSheet } from "react-native";
import { useAppContext } from "../../context/AppContext";
import {
  fullSwipeThreshold,
  itemAnimHideThreshold,
} from "./TechniquePickerViewPager";
import { fontMono, fontLight } from "../../config/fonts";

import type { TechniqueSection } from "../../types/Technique";
import { plural } from "../../utils/plural";

interface Props {
  panX: Animated.Value;
  position: "prev" | "curr" | "next" | undefined;
  name: string;
  sections: TechniqueSection[];
  description: string;
}

export const TechniquePickerItem: FC<Props> = ({
  panX,
  position,
  name,
  sections,
  description,
  children,
}) => {
  const { theme } = useAppContext();
  let titleOpacity: Animated.AnimatedInterpolation | number = 1;
  let titleTranslateX: Animated.AnimatedInterpolation | number = 0;
  let descriptionOpacity: Animated.AnimatedInterpolation | number = 1;
  let descriptionScale: Animated.AnimatedInterpolation | number = 1;
  if (position === "curr") {
    titleOpacity = panX.interpolate({
      inputRange: [-itemAnimHideThreshold, 0, itemAnimHideThreshold],
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });
    titleTranslateX = panX.interpolate({
      inputRange: [-itemAnimHideThreshold, 0, itemAnimHideThreshold],
      outputRange: [-10, 0, -10],
      extrapolate: "clamp",
    });
    descriptionOpacity = panX.interpolate({
      inputRange: [-itemAnimHideThreshold, 0, itemAnimHideThreshold],
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });
    descriptionScale = panX.interpolate({
      inputRange: [-itemAnimHideThreshold, 0, itemAnimHideThreshold],
      outputRange: [1.1, 1, 1.1],
      extrapolate: "clamp",
    });
  } else if (position === "prev") {
    titleOpacity = panX.interpolate({
      inputRange: [
        -fullSwipeThreshold,
        -itemAnimHideThreshold,
        itemAnimHideThreshold,
        fullSwipeThreshold,
      ],
      outputRange: [0, 0, 0, 1],
      extrapolate: "clamp",
    });
    descriptionOpacity = panX.interpolate({
      inputRange: [-itemAnimHideThreshold, 0, itemAnimHideThreshold],
      outputRange: [0, 0, 1],
      extrapolate: "clamp",
    });
    descriptionScale = panX.interpolate({
      inputRange: [-itemAnimHideThreshold, 0, itemAnimHideThreshold],
      outputRange: [1, 1.1, 1],
      extrapolate: "clamp",
    });
  } else {
    titleOpacity = panX.interpolate({
      inputRange: [
        -fullSwipeThreshold,
        -itemAnimHideThreshold,
        itemAnimHideThreshold,
        fullSwipeThreshold,
      ],
      outputRange: [1, 0, 0, 0],
      extrapolate: "clamp",
    });
    descriptionOpacity = panX.interpolate({
      inputRange: [-itemAnimHideThreshold, 0, itemAnimHideThreshold],
      outputRange: [1, 0, 0],
      extrapolate: "clamp",
    });
    descriptionScale = panX.interpolate({
      inputRange: [-itemAnimHideThreshold, 0, itemAnimHideThreshold],
      outputRange: [1, 1.1, 1],
      extrapolate: "clamp",
    });
  }
  const titleAnimatedStyle = {
    opacity: titleOpacity,
    transform: [{ translateX: titleTranslateX }],
  };
  const descriptionAnimatedStyle = {
    opacity: descriptionOpacity,
    transform: [{ scale: descriptionScale }],
  };
  return (
    <Animated.View style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={styles.content}
        pointerEvents={position !== "curr" ? "none" : undefined}
      >
        <Animated.View style={[styles.title, titleAnimatedStyle]}>
          <Animated.Text style={[styles.titleText, { color: theme.textColor }]}>
            {name}
          </Animated.Text>
          {sections.map((s, ii) => (
            <Animated.Text
              key={ii}
              style={[styles.durationsText, { color: theme.textColor }]}
            >
              {s.durations.join(" - ")}
              {s.repeat ? ` - ${plural(s.repeat, "time", "times")}` : null}
            </Animated.Text>
          ))}
        </Animated.View>
        <Animated.View style={[styles.description, descriptionAnimatedStyle]}>
          {name !== "Custom" ? (
            <Animated.Text
              style={[styles.descriptionText, { color: theme.textColor }]}
            >
              {description}
            </Animated.Text>
          ) : undefined}
          {children}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    paddingHorizontal: 32,
    paddingBottom: 48,
    width: "100%",
  },
  content: {
    marginHorizontal: 4,
    marginTop: 28,
    height: "100%",
  },
  title: {},
  description: {},
  titleText: {
    fontSize: 40,
    ...fontLight,
  },
  durationsText: {
    marginTop: 6,
    fontSize: 30,
    ...fontMono,
  },
  descriptionText: {
    marginTop: 16,
    fontSize: 24,
    ...fontLight,
  },
});
