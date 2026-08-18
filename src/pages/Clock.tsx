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
};

export function Clock({ blocks }: ClockProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const now = useNow();

  // The schedule is pinned to the moment this page opened, not to every tick.
  const [startedAt] = useState(() => Date.now());
  const schedule = useMemo(
    () => buildSchedule(blocks, startedAt),
    [blocks, startedAt],
  );

  const isEmpty = schedule.blocks.length === 0;
  const isFinished = !isEmpty && now >= schedule.end;
  const [dismissedFinish, setDismissedFinish] = useState(false);
  const hasChimed = useRef(false);

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
            back
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
