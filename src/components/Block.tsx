import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isValidDuration, type BlockData } from "../data/BlockData";

type BlockProps = BlockData & {
  onChange: (patch: Partial<BlockData>) => void;
  onRemove: () => void;
};

export function Block({
  id,
  name,
  color,
  duration,
  onChange,
  onRemove,
}: BlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const durationValid = duration === "" || isValidDuration(duration);

  return (
    <div
      className="flex items-center gap-2 border rounded-sm p-2"
      ref={setNodeRef}
      style={style}
    >
      <span {...attributes} {...listeners}>
        ⠿
      </span>{" "}
      <input
        type="color"
        value={color}
        onChange={(e) => onChange({ color: e.target.value })}
      />
      <input
        type="text"
        name="name"
        className="px-2 py-1 text-sm w-25"
        value={name}
        placeholder="Block Name"
        onChange={(e) => onChange({ name: e.target.value })}
      ></input>
      <label className="text-sm">Span - </label>
      <input
        type="text"
        className={`px-2 py-1 text-sm w-15 ${
          durationValid ? "text-green-600" : "text-red-500"
        }`}
        name="duration"
        value={duration}
        placeholder="00:00"
        onChange={(e) => onChange({ duration: e.target.value })}
      />
      <button
        className="text-sm text-red-500 hover:text-red-300 border rounded-sm p-1"
        onClick={onRemove}
      >
        Remove
      </button>
    </div>
  );
}
