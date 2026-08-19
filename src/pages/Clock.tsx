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

export function Clock({ blocks, start }: ClockProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const now = useNow();

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
    <div className="flex flex-col h-dvh overflow-hidden w-full items-center">
      <label className="shrink-0 text-2xl py-5 font-extrabold">
        TeacherTime
      </label>

      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-2 px-2">
        {isEmpty ? (
          <span className="my-auto text-sm">
            No blocks with a time set yet — go back and add some.
          </span>
        ) : (
          <>
            <div className="w-full max-w-[min(90vw,60rem)] shrink-0">
              <ClockCarousel
                clocks={schedule.clocks}
                index={clockIndexAt(schedule, now)}
                now={now}
              />
            </div>
            <Legend
              blocks={schedule.blocks}
              activeIndex={blockIndexAt(schedule, now)}
              now={now}
            />
          </>
        )}

        <div className="flex justify-between w-full max-w-100 py-2 shrink-0">
          <button
            className="text-sm text-blue-500 hover:text-blue-300 border rounded-sm p-1"
            onClick={goBack}
          >
            Back
          </button>
        </div>
      </div>

      {isFinished && !dismissedFinish && (
        <FinishedModal
          onClose={() => setDismissedFinish(true)}
          onBackToSettings={goBack}
        />
      )}
    </div>
  );
}
