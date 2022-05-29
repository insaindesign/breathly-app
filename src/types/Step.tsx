export interface StepConfig {
  id: string;
  label: string;
}

export interface Step extends StepConfig {
  duration: number;
  showDots: boolean;
  skipped: boolean;
}
