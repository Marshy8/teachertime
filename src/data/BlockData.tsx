export type BlockData = {
  id: string;
  name: string;
  color: string;
  duration: string;
};

export function isValidDuration(value: string): boolean {
  return /^\d{2}:[0-5]\d$/.test(value);
}
