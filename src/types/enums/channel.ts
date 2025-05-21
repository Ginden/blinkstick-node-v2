export const Channel = {
  R: 0,
  G: 1,
  B: 2,
} as const;

export type Channel = (typeof Channel)[keyof typeof Channel];
