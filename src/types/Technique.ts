export interface TechniqueSection {
  durations: number[];
  repeat: number;
}

export interface Technique {
  id: string;
  name: string;
  sections: [];
  description: string;
  color: string;
}
