import { ClockFace } from "./ClockFace";
import { formatTime, type ClockHour } from "../data/schedule";

type ClockCarouselProps = {
  clocks: ClockHour[];
  /** Index of the clock to show in the centre. */
  index: number;
  now: number;
};

/**
 * Shows three faces at a time: the previous hour shrunk on the left, the current
 * hour large in the centre, the next hour shrunk on the right. Every face is
 * always mounted and positioned by its offset from `index`, so advancing the
 * index slides the whole row across.
 */
export function ClockCarousel({ clocks, index, now }: ClockCarouselProps) {
  return (
    <div className="relative w-full aspect-[9/4] overflow-hidden">
      {clocks.map((clock, i) => {
        const offset = i - index;
        const isCurrent = offset === 0;
        const isVisible = Math.abs(offset) <= 1;

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
                  wedges={clock.wedges}
                  now={isCurrent ? now : undefined}
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
