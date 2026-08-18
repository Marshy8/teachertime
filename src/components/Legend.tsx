import {
  formatRemaining,
  formatTime,
  type ScheduledBlock,
} from "../data/schedule";

function blockName(block: ScheduledBlock, index: number): string {
  return block.name.trim() === "" ? `Block ${index + 1}` : block.name;
}

type LegendProps = {
  blocks: ScheduledBlock[];
  /** Index of the running block, or -1 when nothing is running. */
  activeIndex: number;
  now: number;
};

/** Current block up top, the rest of the day rolling along underneath it. */
export function Legend({ blocks, activeIndex, now }: LegendProps) {
  const current = activeIndex >= 0 ? blocks[activeIndex] : null;
  const upcoming = blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.start > now);

  return (
    <div className="w-full max-w-100 flex flex-col gap-2 min-h-0">
      {current && (
        <div className="flex items-center gap-2 border rounded-sm p-2 shrink-0">
          <span
            className="w-6 h-6 rounded-sm shrink-0 border"
            style={{ backgroundColor: current.color }}
          />
          <span className="font-extrabold truncate">
            {blockName(current, activeIndex)}
          </span>
          <span className="counter ml-auto shrink-0 text-sm">
            {formatRemaining(current.end - now)} left
          </span>
        </div>
      )}

      <div className="border rounded-sm p-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden h-[calc(3*2.5rem+2*0.5rem)]">
        <div className="flex flex-col gap-2">
          {upcoming.map(({ block, index }) => (
            <div
              key={block.id}
              className="flex items-center gap-2 border rounded-sm p-2 text-sm opacity-60 shrink-0 h-10"
            >
              <span
                className="w-4 h-4 rounded-sm shrink-0 border"
                style={{ backgroundColor: block.color }}
              />
              <span className="truncate">{blockName(block, index)}</span>
              <span className="counter ml-auto shrink-0 text-sm">
                {formatTime(block.start)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
