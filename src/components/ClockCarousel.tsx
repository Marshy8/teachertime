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
  /**
   * Width classes of the legend column on the left. The next hour sits in a
   * column of exactly the same width on the right, and that mirroring is what
   * leaves the current hour centred on the page.
   */
  sideClassName: string;
};

/**
 * Two columns: the current hour as large as the space allows in the middle of
 * the page, and the next hour small beside it on the right. Nothing animates
 * and nothing slides — the legend sits immediately to the left, so a face
 * moving that way would run into it. When the hour turns, the next face simply
 * becomes the current one. Hours that are over aren't drawn at all: everything
 * on screen is now or still to come.
 */
export function ClockCarousel({
  clocks,
  index,
  now,
  sideClassName,
}: ClockCarouselProps) {
  const current = clocks[index];
  const next = clocks[index + 1];

  return (
    <>
      <div className="flex-1 min-w-0 flex items-center justify-center">
        {current && (
          // Square box a little inside the column, shrunk further by `max-h`
          // when the window is short. The SVG keeps its own square shape
          // inside it, so the face is as big as the space allows, stays
          // centred in the column, and keeps its time label right underneath.
          <div className="w-[92%] aspect-square max-h-[92%] flex flex-col items-center gap-1">
            <div className="flex-1 min-h-0 w-full">
              <ClockFace
                wedges={remainingWedges(current, now)}
                // Being the centre face isn't enough to draw hands on it: with
                // a start time in the future, or a schedule already over, the
                // centre face is the nearest one rather than the one `now`
                // actually falls in, and real hands there would mislead.
                now={containsTime(current, now) ? now : undefined}
              />
            </div>
            <span className="counter shrink-0 text-sm">
              {formatTime(current.hourStart)}
            </span>
          </div>
        )}
      </div>

      <div className={`${sideClassName} flex items-center justify-start`}>
        {next && (
          // Clearly smaller than the current hour, and pushed to the left of
          // its column so it sits beside the current face rather than adrift.
          <div className="w-[60%] aspect-square max-h-[45%] flex flex-col items-center gap-1 opacity-35">
            <div className="flex-1 min-h-0 w-full">
              <ClockFace wedges={remainingWedges(next, now)} />
            </div>
            <span className="counter shrink-0 text-sm">
              {formatTime(next.hourStart)}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
