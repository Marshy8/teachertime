export type BlockData = {
  id: string;
  name: string;
  color: string;
  duration: string;
};

export function isValidDuration(value: string): boolean {
  return /^\d{2}:[0-5]\d$/.test(value);
}

export function durationToMinutes(value: string): number {
  if (!isValidDuration(value)) return 0;
  const [hour, minute] = value.split(":");
  return parseInt(hour, 10) * 60 + parseInt(minute, 10);
}

export function randomColor(): string {
  return "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
}

export function createBlock(color: string = randomColor()): BlockData {
  return { id: crypto.randomUUID(), name: "", color, duration: "" };
}
