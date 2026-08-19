import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Block } from "../components/Block";
import { InfoModal } from "../components/InfoModal";
import {
  createBlock,
  durationToMinutes,
  isValidDuration,
  type BlockData,
} from "../data/BlockData";
import { resolveStart } from "../data/schedule";
import { saveSession } from "../data/storage";
import { useNow } from "../hooks/useNow";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

type SettingsProps = {
  blocks: BlockData[];
  setBlocks: (blocks: BlockData[]) => void;
  /** `HH:MM` from the time input, or "" meaning "start now". */
  startTime: string;
  setStartTime: (startTime: string) => void;
  setStart: (start: number) => void;
};

export function Settings({
  blocks,
  setBlocks,
  startTime,
  setStartTime,
  setStart,
}: SettingsProps) {
  const navigate = useNavigate();
  const sensors = useSensors(useSensor(PointerSensor));
  // Only drives the "already under way" hint, so a coarse tick is plenty.
  const now = useNow(30_000);
  const [showInfo, setShowInfo] = useState(false);

  function addBlock() {
    setBlocks([...blocks, createBlock()]);
  }

  /**
   * Pins the schedule to a real instant and saves it. Saving here rather than
   * on every keystroke means a half-edited schedule the teacher walked away
   * from can't overwrite the one they actually ran.
   */
  function submit() {
    saveSession({ blocks, startTime });
    setStart(resolveStart(startTime));
    navigate("/clock");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    setBlocks(arrayMove(blocks, oldIndex, newIndex));
  }

  function calculateTime(inputs: string[]): string {
    let totalMin: number = 0;

    for (const input of inputs) {
      totalMin += durationToMinutes(input);
    }

    let hour: string = Math.floor(totalMin / 60).toString();
    let minute: string = (totalMin % 60).toString();

    if (hour.length === 1) {
      hour = `0${hour}`;
    }
    if (minute.length === 1) {
      minute = `0${minute}`;
    }
    return `${hour}:${minute}`;
  }

  const validDurations = blocks
    .filter((b) => isValidDuration(b.duration))
    .map((b) => b.duration);
  const hasSchedule = validDurations.some((d) => durationToMinutes(d) > 0);

  return (
    <div className="flex flex-col h-dvh overflow-hidden w-full items-center">
      <label className="shrink-0 text-2xl py-5 font-extrabold">
        TeacherTime
      </label>

      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-2">
        <span className="counter">
          Total Minutes-{" "}
          <span className="text-green-600">
            {calculateTime(validDurations)}
          </span>
        </span>

        <div className="flex items-center gap-2">
          <label className="text-sm" htmlFor="start-time">
            Start at
          </label>
          <input
            id="start-time"
            type="time"
            className="px-2 py-1 text-sm border rounded-sm"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <span className="text-sm opacity-60">
            {startTime === ""
              ? "leave blank to start now"
              : resolveStart(startTime, now) < now
                ? "already under way"
                : "later today"}
          </span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="w-full max-w-100 aspect-square border rounded-sm p-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {blocks.map((b) => (
                  <Block
                    key={b.id}
                    {...b}
                    onChange={(patch) =>
                      setBlocks(
                        blocks.map((x) =>
                          x.id === b.id ? { ...x, ...patch } : x,
                        ),
                      )
                    }
                    onRemove={() =>
                      setBlocks(blocks.filter((x) => x.id !== b.id))
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </DndContext>

        <div className="grid grid-cols-3 items-center w-full max-w-100 py-2">
          <button
            className="text-sm text-green-500 hover:text-green-300 border rounded-sm p-1 justify-self-start"
            onClick={addBlock}
          >
            Add Block
          </button>
          <button
            className="text-sm text-pink-500 hover:text-pink-300 border rounded-sm p-1 justify-self-center"
            aria-label="About TeacherTime"
            onClick={() => setShowInfo(true)}
          >
            ⓘ
          </button>
          <button
            className="text-sm text-blue-500 hover:text-blue-300 border rounded-sm p-1 disabled:text-gray-400 disabled:hover:text-gray-400 justify-self-end"
            disabled={!hasSchedule}
            onClick={submit}
          >
            Submit
          </button>
        </div>
      </div>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}
