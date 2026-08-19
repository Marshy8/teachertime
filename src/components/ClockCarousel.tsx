import { ClockFace } from "./ClockFace";
import {
  containsTime,
  formatTime,
  remainingWedges,
  type ClockHour,
} from "../data/schedule";

type ClockCarouselProps = {
  clocks: ClockHour[];
  /** Index of the clock to show in the centre. */
  index: number;
  now: number;
};

/**
 * Shows the current hour large in the centre and the next hour shrunk on the
 * right. Hours that have already passed are left mounted but hidden, so they
 * still slide off to the left and fade as the row advances rather than popping
 * out — but a child is never shown an hour that's over. Every face is
 * positioned by its offset from `index`, so advancing the index slides the
 * whole row across.
 */
export function ClockCarousel({ clocks, index, now }: ClockCarouselProps) {
  return (
    <div className="relative w-full aspect-[9/4] overflow-hidden">
      {clocks.map((clock, i) => {
        const offset = i - index;
        const isCurrent = offset === 0;
        // Past hours stay in the DOM to animate out, but never stay on screen.
        const isVisible = offset >= 0 && offset <= 1;

        return (
          <div
            key={clock.hourStart}
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-[transform,opacity] duration-500 ease-out"
            style={{
              // Percentages here resolve against this div's own size (the full
              // carousel box, via inset-0), so the offset scales with the
              // container instead of an unrelated fallback size.
              transform: `translateX(${offset * 38}%) scale(${isCurrent ? 1 : 0.55})`,
              opacity: isVisible ? (isCurrent ? 1 : 0.35) : 0,
            }}
          >
            <div className="h-full flex flex-col items-center gap-1">
              <div className="flex-1 min-h-0 aspect-square">
                <ClockFace
                  wedges={remainingWedges(clock, now)}
                  // Centring a face isn't enough to draw hands on it: with a
                  // start time in the future, or a schedule already over, the
                  // centre face is the nearest one rather than the one `now`
                  // actually falls in, and real hands there would mislead.
                  now={
                    isCurrent && containsTime(clock, now) ? now : undefined
                  }
                />
              </div>
              <span className="counter shrink-0 text-sm">
                {formatTime(clock.hourStart)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
