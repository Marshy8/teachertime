import { durationToMinutes, type BlockData } from "./BlockData";

export const MS_PER_MINUTE = 60_000;

/** One block placed on an absolute timeline (epoch ms). */
export type ScheduledBlock = {
  id: string;
  name: string;
  color: string;
  start: number;
  end: number;
};

/** A slice of one block as it appears on a single clock face. */
export type Wedge = {
  key: string;
  color: string;
  startAngle: number;
  endAngle: number;
};

/** One clock face, representing the wall-clock hour beginning at `hourStart`. */
export type ClockHour = {
  hourStart: number;
  wedges: Wedge[];
};

export type Schedule = {
  start: number;
  end: number;
  blocks: ScheduledBlock[];
  clocks: ClockHour[];
};

function floorToHour(ms: number): number {
  const d = new Date(ms);
  d.setMinutes(0, 0, 0);
  return d.getTime();
}

function nextHour(ms: number): number {
  const d = new Date(ms);
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d.getTime();
}

/**
 * Resolves the `HH:MM` value of an `<input type="time">` to an absolute instant
 * on `reference`'s day. A blank input means "start now", so it returns
 * `reference` unchanged. Built with setHours rather than epoch arithmetic for
 * the same reason floorToHour is: half-hour timezones and DST.
 */
export function resolveStart(
  time: string,
  reference: number = Date.now(),
): number {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (match === null) return reference;

  const d = new Date(reference);
  d.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return d.getTime();
}

/**
 * Lays the blocks end to end starting at `start`, then cuts that timeline at
 * wall-clock hour boundaries so each clock face covers exactly one hour. A block
 * that straddles a boundary yields a wedge on both faces.
 *
 * `from` is the earliest hour that should get a face, for a schedule that hasn't
 * begun yet: the hours between it and `start` come out as faces with no wedges,
 * so the carousel can sit on the real current hour and let the first block hour
 * arrive from the upcoming slot. Defaults to `start`, i.e. no lead-in.
 */
export function buildSchedule(
  blocks: BlockData[],
  start: number,
  from: number = start,
): Schedule {
  const scheduled: ScheduledBlock[] = [];
  let cursor = start;

  for (const block of blocks) {
    const minutes = durationToMinutes(block.duration);
    if (minutes <= 0) continue;
    const end = cursor + minutes * MS_PER_MINUTE;
    scheduled.push({
      id: block.id,
      name: block.name,
      color: block.color,
      start: cursor,
      end,
    });
    cursor = end;
  }

  const end = cursor;
  const clocks: ClockHour[] = [];

  if (scheduled.length > 0) {
    const lastHour = floorToHour(end - 1);
    for (
      let hourStart = floorToHour(Math.min(start, from));
      hourStart <= lastHour;
      hourStart = nextHour(hourStart)
    ) {
      const hourEnd = nextHour(hourStart);
      const wedges: Wedge[] = [];

      for (const block of scheduled) {
        const from = Math.max(block.start, hourStart);
        const to = Math.min(block.end, hourEnd);
        if (to <= from) continue;
        wedges.push({
          key: `${block.id}-${hourStart}`,
          color: block.color,
          startAngle: ((from - hourStart) / MS_PER_MINUTE) * 6,
          endAngle: ((to - hourStart) / MS_PER_MINUTE) * 6,
        });
      }

      clocks.push({ hourStart, wedges });
    }
  }

  return { start, end, blocks: scheduled, clocks };
}

/** Index of the clock face covering `now`, clamped to the schedule's range. */
export function clockIndexAt(schedule: Schedule, now: number): number {
  const { clocks } = schedule;
  if (clocks.length === 0) return 0;
  for (let i = 0; i < clocks.length; i++) {
    if (now < nextHour(clocks[i].hourStart)) return i;
  }
  return clocks.length - 1;
}

/** True when `now` falls inside the hour this face covers. */
export function containsTime(clock: ClockHour, now: number): boolean {
  return now >= clock.hourStart && now < nextHour(clock.hourStart);
}

/**
 * This face's wedges with everything before `now` trimmed off, so the color a
 * child sees is always time still to come. Elapsed minutes of the running block
 * shrink away behind the hand, a block that has already finished disappears,
 * and a face whose hour is over comes back empty. Faces in the future are
 * untouched.
 */
export function remainingWedges(clock: ClockHour, now: number): Wedge[] {
  if (now <= clock.hourStart) return clock.wedges;
  if (now >= nextHour(clock.hourStart)) return [];

  const elapsed = ((now - clock.hourStart) / MS_PER_MINUTE) * 6;
  return clock.wedges
    .filter((wedge) => wedge.endAngle > elapsed)
    .map((wedge) =>
      wedge.startAngle >= elapsed ? wedge : { ...wedge, startAngle: elapsed },
    );
}

/** Index of the block running at `now`, or -1 if the schedule isn't running. */
export function blockIndexAt(schedule: Schedule, now: number): number {
  return schedule.blocks.findIndex((b) => now >= b.start && now < b.end);
}

export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Remaining time as `M:SS`, for the countdown on the active block. */
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
