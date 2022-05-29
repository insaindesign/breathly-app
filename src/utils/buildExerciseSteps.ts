import { steps } from "../config/steps";
import { Step } from "../types/Step";

// Given an array of durations (e.g.: [4, 4, 4, 4]) maps it to an array of
// objects with the steps informations
export const buildExerciseSteps = (durations: number[]): Step[] =>
  steps.map((step, index) => ({
    ...step,
    duration: durations[index] * 1000,
    showDots: step.id === "afterInhale" || step.id === "afterExhale",
    skipped: durations[index] === 0,
  }));
