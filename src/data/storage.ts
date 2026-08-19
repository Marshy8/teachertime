import type { BlockData } from "./BlockData";

/**
 * Versioned so a future change to BlockData can't be handed a stale shape.
 * Bump the suffix instead of trying to migrate old blobs.
 */
const KEY = "teachertime.session.v1";

/** The schedule as it was when the teacher last pressed Submit. */
export type SavedSession = {
  blocks: BlockData[];
  startTime: string;
};

function isBlockData(value: unknown): value is BlockData {
  if (typeof value !== "object" || value === null) return false;
  const block = value as Record<string, unknown>;
  return (
    typeof block.id === "string" &&
    typeof block.name === "string" &&
    typeof block.color === "string" &&
    typeof block.duration === "string"
  );
}

/**
 * Returns the saved session, or null if there isn't one, the store is
 * unreadable, or the contents don't match the current shape. Deliberately
 * all-or-nothing: a half-understood blob is worse than falling back to a
 * fresh schedule.
 */
export function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const { blocks, startTime } = parsed as Record<string, unknown>;
    if (!Array.isArray(blocks) || blocks.length === 0) return null;
    if (!blocks.every(isBlockData)) return null;

    return {
      blocks,
      startTime: typeof startTime === "string" ? startTime : "",
    };
  } catch {
    // Disabled storage (private mode) or truncated JSON — start fresh.
    return null;
  }
}

export function saveSession(session: SavedSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // A full or blocked store shouldn't stop the teacher starting their day.
  }
}
