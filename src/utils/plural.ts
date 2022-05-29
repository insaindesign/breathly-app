export const plural = (amount: number, singular: string, plural: string) =>
  `${amount} ${amount === 1 ? singular : plural}`;
