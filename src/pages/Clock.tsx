import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClockCarousel } from "../components/ClockCarousel";
import { FinishedModal } from "../components/FinishedModal";
import { Legend } from "../components/Legend";
import type { BlockData } from "../data/BlockData";
import { blockIndexAt, buildSchedule, clockIndexAt } from "../data/schedule";
import { useNow } from "../hooks/useNow";
import chimeUrl from "../assets/chime.mp3";

type ClockProps = {
  blocks: BlockData[];
  /** Absolute instant the schedule runs from, resolved by Settings on Submit. */
  start: number;
};

/**
 * The legend column on the left and the next-hour column on the right are the
 * same width, so the column between them — and the clock face centred in it —
 * lands exactly in the middle of the page.
 */
const SIDE_COLUMN = "w-112 max-w-[32%] shrink-0";

function BackButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      className={`text-sm text-blue-500 hover:text-blue-300 border rounded-sm p-1 ${className}`}
      onClick={onClick}
    >
      Back
    </button>
  );
}

export function Clock({ blocks, start }: ClockProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const now = useNow(1_000);

  // Pads the carousel back to the hour this page opened in, so a schedule that
  // hasn't begun yet still shows the real current hour as an empty face. Pinned
  // rather than tracking `now` so the lead-in faces don't get trimmed away as
  // the hours pass — this only sets how far back the carousel reaches, never
  // when the schedule runs.
  const [openedAt] = useState(() => Date.now());
  // `start` is already an absolute instant, so this can't slide as time passes.
  const schedule = useMemo(
    () => buildSchedule(blocks, start, openedAt),
    [blocks, start, openedAt],
  );

  const isEmpty = schedule.blocks.length === 0;
  const isFinished = !isEmpty && now >= schedule.end;
  const [dismissedFinish, setDismissedFinish] = useState(false);
  // A start time far enough in the past that the day is already over shouldn't
  // chime on arrival — only a schedule that finishes while we're watching does.
  const hasChimed = useRef(isFinished);

  useEffect(() => {
    if (!isFinished || hasChimed.current) return;
    hasChimed.current = true;
    const chime = new Audio(chimeUrl);
    chime.volume = 0.5;
    // Missing file or a blocked autoplay shouldn't take the page down.
    chime.play().catch(() => {});
  }, [isFinished]);

  function goBack() {
    if (location.key === "default") navigate("/", { replace: true });
    else navigate(-1);
  }

  return (
    // #root is a fixed 1126px column, which is right for Settings but wastes
    // half a projector on the clock. This page breaks out of it and uses the
    // whole window, so the face can be as large as the room needs.
    <div className="flex flex-col h-dvh overflow-hidden items-center w-dvw ml-[calc(50%-50dvw)]">
      <label className="shrink-0 text-2xl py-5 font-extrabold">
        TeacherTime
      </label>

      {isEmpty ? (
        <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-2 px-2">
          <span className="text-sm">
            No blocks with a time set yet — go back and add some.
          </span>
          <BackButton onClick={goBack} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 w-full flex justify-center gap-4 px-4 pb-4">
          {/* Left column: what's running now, what's still to come, and the
              way back out. */}
          <div
            className={`${SIDE_COLUMN} flex flex-col justify-center gap-2 min-h-0`}
          >
            <Legend
              blocks={schedule.blocks}
              activeIndex={blockIndexAt(schedule, now)}
              now={now}
            />
            <BackButton onClick={goBack} className="self-center shrink-0" />
          </div>

          <ClockCarousel
            clocks={schedule.clocks}
            index={clockIndexAt(schedule, now)}
            now={now}
            sideClassName={SIDE_COLUMN}
          />
        </div>
      )}

      {isFinished && !dismissedFinish && (
        <FinishedModal
          onClose={() => setDismissedFinish(true)}
          onBackToSettings={goBack}
        />
      )}
    </div>
  );
}
