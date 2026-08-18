import { useNavigate } from "react-router-dom";
import { Block } from "../components/Block";
import {
  createBlock,
  durationToMinutes,
  isValidDuration,
  type BlockData,
} from "../data/BlockData";
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
};

export function Settings({ blocks, setBlocks }: SettingsProps) {
  const navigate = useNavigate();
  const sensors = useSensors(useSensor(PointerSensor));

  function addBlock() {
    setBlocks([...blocks, createBlock()]);
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
          Total Minutes: {calculateTime(validDurations)}
        </span>

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

        <div className="flex justify-between w-full max-w-100 py-2">
          <button
            className="text-sm text-green-500 hover:text-green-300 border rounded-sm p-1"
            onClick={addBlock}
          >
            Add Block
          </button>
          <button
            className="text-sm shrink-0 text-blue-500 hover:text-blue-300 border rounded-sm p-1 disabled:text-gray-400 disabled:hover:text-gray-400"
            disabled={!hasSchedule}
            onClick={() => navigate("/clock")}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
