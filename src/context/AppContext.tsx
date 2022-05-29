import React, {
  createContext,
  Dispatch,
  FC,
  useContext,
  useReducer,
} from "react";
import { Appearance } from "react-native";
import { produce } from "immer";
import { darkThemeColors, lightThemeColors } from "../config/themes";
import {
  restoreJson,
  restoreString,
  restoreNumber,
  restoreBoolean,
  persistString,
  persistJson,
  persistNumber,
  persistBoolean,
} from "../services/storage";
import { techniques } from "../config/techniques";
import type { GuidedBreathingMode } from "../types/GuidedBreathingMode";
import type { TechniqueSection } from "../types/Technique";

type SystemColorScheme = "no-preference" | "dark" | "light";

type Action =
  | { type: "INITIALIZE"; payload: State }
  | { type: "SET_SYSTEM_COLOR_SCHEME"; payload: SystemColorScheme }
  | { type: "SET_TECHNIQUE_ID"; payload: string }
  | { type: "SET_TIMER_DURATION"; payload: number }
  | { type: "SET_GUIDED_BREATHING_MODE"; payload: GuidedBreathingMode }
  | { type: "TOGGLE_FOLLOW_SYSTEM_DARK_MODE" }
  | { type: "TOGGLE_CUSTOM_DARK_MODE" }
  | { type: "TOGGLE_STEP_VIBRATION" }
  | { type: "SET_CUSTOM_PATTERN_SECTIONS"; payload: TechniqueSection[] };

interface State {
  ready: boolean;
  systemColorScheme: SystemColorScheme;
  techniqueId: string;
  timerDuration: number;
  customDarkModeFlag: boolean;
  followSystemDarkModeFlag: boolean;
  guidedBreathingMode: GuidedBreathingMode;
  stepVibrationFlag: boolean;
  customPatternSections: TechniqueSection[];
}

const initialCustomPatternSections: TechniqueSection[] = techniques.find(
  (x) => x.id === "custom"
)?.sections!;

const initialState: State = {
  ready: false,
  systemColorScheme: "no-preference",
  techniqueId: "square",
  timerDuration: 0,
  followSystemDarkModeFlag: false,
  customDarkModeFlag: false,
  guidedBreathingMode: "disabled",
  stepVibrationFlag: false,
  customPatternSections: initialCustomPatternSections,
};

const reducer = produce((draft: State = initialState, action: Action) => {
  switch (action.type) {
    case "INITIALIZE": {
      return { ...initialState, ...action.payload, ready: true };
    }
    case "SET_SYSTEM_COLOR_SCHEME": {
      draft.systemColorScheme = action.payload;
      return;
    }
    case "SET_TECHNIQUE_ID": {
      draft.techniqueId = action.payload;
      return;
    }
    case "SET_TIMER_DURATION": {
      draft.timerDuration = action.payload;
      return;
    }
    case "TOGGLE_CUSTOM_DARK_MODE": {
      draft.customDarkModeFlag = !draft.customDarkModeFlag;
      return;
    }
    case "TOGGLE_STEP_VIBRATION": {
      draft.stepVibrationFlag = !draft.stepVibrationFlag;
      return;
    }
    case "TOGGLE_FOLLOW_SYSTEM_DARK_MODE": {
      draft.followSystemDarkModeFlag = !draft.followSystemDarkModeFlag;
      draft.customDarkModeFlag = false;
      return;
    }
    case "SET_GUIDED_BREATHING_MODE": {
      draft.guidedBreathingMode = action.payload;
      return;
    }
    case "SET_CUSTOM_PATTERN_SECTIONS": {
      draft.customPatternSections = action.payload;
      return;
    }
  }
});

const getTechnique = (state: State) => {
  return techniques.find((x) => x.id === state.techniqueId)!;
};

const getTheme = (state: State) => {
  const technique = getTechnique(state);
  let darkMode = false;
  if (state.followSystemDarkModeFlag) {
    darkMode = state.systemColorScheme === "dark";
  } else {
    darkMode = state.customDarkModeFlag;
  }
  return {
    darkMode: darkMode,
    ...(darkMode ? darkThemeColors : lightThemeColors),
    mainColor: technique.color,
  };
};

interface AppContext {
  state: State;
  dispatch: Dispatch<Action>;
}

const AppContext = createContext<AppContext>({
  state: initialState,
  dispatch: () => null,
});

export const AppContextProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    // TODO: Fix this readyonly Array error
    // @ts-ignore
    <AppContext.Provider value={{ state: state!, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const { state, dispatch } = useContext(AppContext);
  const initialize = async () => {
    const [
      techniqueId,
      timerDuration,
      customDarkModeFlag,
      followSystemDarkModeFlag,
      _guidedBreathingMode,
      stepVibrationFlag,
      customPatternSections,
    ] = await Promise.all([
      restoreString("techniqueId", "square"),
      restoreNumber("timerDuration", 0),
      restoreBoolean("customDarkModeFlag"),
      restoreBoolean("followSystemDarkModeFlag"),
      restoreString("guidedBreathingMode", "disabled"),
      restoreBoolean("stepVibrationFlag"),
      restoreJson("customPatternSections", initialCustomPatternSections),
    ]);
    const colorScheme: SystemColorScheme =
      Appearance.getColorScheme() || "no-preference";
    const guidedBreathingMode = _guidedBreathingMode as GuidedBreathingMode;
    const payload = {
      ...initialState,
      systemColorScheme: colorScheme,
      techniqueId,
      timerDuration,
      customDarkModeFlag,
      followSystemDarkModeFlag,
      guidedBreathingMode,
      stepVibrationFlag,
      customPatternSections,
    };
    dispatch({ type: "INITIALIZE", payload: payload });
  };
  const setSystemColorScheme = (systemColorScheme: SystemColorScheme) => {
    dispatch({ type: "SET_SYSTEM_COLOR_SCHEME", payload: systemColorScheme });
  };
  const setTechniqueId = (techniqueId: string) => {
    persistString("techniqueId", techniqueId);
    dispatch({ type: "SET_TECHNIQUE_ID", payload: techniqueId });
  };
  const setTimerDuration = (timerDuration: number) => {
    persistNumber("timerDuration", timerDuration);
    dispatch({ type: "SET_TIMER_DURATION", payload: timerDuration });
  };
  const toggleTimer = () => {
    const timerDuration = state.timerDuration ? 0 : 3 * 1000 * 60;
    persistNumber("timerDuration", timerDuration);
    dispatch({ type: "SET_TIMER_DURATION", payload: timerDuration });
  };
  const toggleCustomDarkMode = () => {
    persistBoolean("customDarkModeFlag", !state.customDarkModeFlag);
    dispatch({ type: "TOGGLE_CUSTOM_DARK_MODE" });
  };
  const toggleFollowSystemDarkMode = () => {
    persistBoolean("followSystemDarkModeFlag", !state.followSystemDarkModeFlag);
    dispatch({ type: "TOGGLE_FOLLOW_SYSTEM_DARK_MODE" });
  };
  const setGuidedBreathingMode = (guidedBreathingMode: GuidedBreathingMode) => {
    persistString("guidedBreathingMode", guidedBreathingMode);
    dispatch({
      type: "SET_GUIDED_BREATHING_MODE",
      payload: guidedBreathingMode,
    });
  };
  const toggleStepVibration = () => {
    persistBoolean("stepVibrationFlag", !state.stepVibrationFlag);
    dispatch({ type: "TOGGLE_STEP_VIBRATION" });
  };
  const updateCustomPatternSection = (
    sectionIndex: number,
    stepIndex: number,
    update: number
  ) => {
    const newCustomPatternSections = produce(
      state.customPatternSections,
      (draft) => {
        draft[sectionIndex].durations[stepIndex] += update;
      }
    );
    persistJson("customPatternSections", newCustomPatternSections);
    dispatch({
      type: "SET_CUSTOM_PATTERN_SECTIONS",
      payload: newCustomPatternSections,
    });
  };
  const addCustomPatternSection = () => {
    const newCustomPatternSections = produce(
      state.customPatternSections,
      (draft) => {
        const last = draft[draft.length - 1];
        draft.push({ durations: [...last.durations], repeat: last.repeat });
      }
    );
    persistJson("customPatternSections", newCustomPatternSections);
    dispatch({
      type: "SET_CUSTOM_PATTERN_SECTIONS",
      payload: newCustomPatternSections,
    });
  };
  const technique = getTechnique(state);
  return {
    ...state,
    theme: getTheme(state),
    technique: {
      ...technique,
      sections:
        technique.id === "custom"
          ? state.customPatternSections
          : technique.sections,
    },
    initialize,
    setSystemColorScheme,
    setTechniqueId,
    setTimerDuration,
    toggleCustomDarkMode,
    toggleFollowSystemDarkMode,
    toggleStepVibration,
    toggleTimer,
    setGuidedBreathingMode,
    updateCustomPatternSection,
    addCustomPatternSection,
  };
};
