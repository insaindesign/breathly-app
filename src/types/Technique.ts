export interface TechniqueSection {
  durations: number[];
  manual?: boolean;
  repeat: number;
}

export interface Technique {
  id: string;
  name: string;
  sections: [];
  description: string;
  color: string;
}
