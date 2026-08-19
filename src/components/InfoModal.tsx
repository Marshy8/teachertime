type InfoModalProps = {
  onClose: () => void;
};

/** Plain-language explanation of the app, opened from the ⓘ on Settings. */
export function InfoModal({ onClose }: InfoModalProps) {
  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-4 border rounded-sm p-6 bg-[var(--bg)] max-w-lg max-h-[80dvh] overflow-y-auto"
        // Clicks inside the panel shouldn't reach the backdrop and close it.
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-2xl font-extrabold">About TeacherTime</span>

        <p className="text-sm">
          Build your day out of colored time blocks, then run it as a row of
          analog clock faces. Each face is one real hour of the day with
          your blocks drawn on it as colored wedges, so students can see how
          much of an activity is left just by reading the clock.
        </p>

        <div className="flex flex-col gap-1">
          <span className="font-extrabold text-sm">Building a schedule</span>
          <ul className="text-sm text-left flex flex-col gap-1 list-disc pl-5">
            <li>Add Block adds a row. Each block has a color, a name, and a length.</li>
            <li>
              Lengths are typed as <span className="counter">HH:MM</span> - a
              45 minute block is <span className="counter">00:45</span>. Green
              means it's readable, red means it isn't.
            </li>
            <li>Drag the ⠿ handle to reorder blocks. Remove deletes one.</li>
            <li>
              Total Minutes is how long your whole day runs once every block is
              laid end to end.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-extrabold text-sm">Start at</span>
          <ul className="text-sm text-left flex flex-col gap-1 list-disc pl-5">
            <li>Leave it blank and the schedule begins the moment you hit Submit.</li>
            <li>
              Set a time earlier than now - say you're setting up at 10:15 for a
              9:00 day - and the clock opens partway through, already on the
              block you should be in.
            </li>
            <li>Set a later time to get everything ready before the day starts.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-extrabold text-sm">Running the clock</span>
          <ul className="text-sm text-left flex flex-col gap-1 list-disc pl-5">
            <li>
              The big face in the middle is the hour you're in now, with moving
              hands. The smaller faces beside it are the hours before and after.
            </li>
            <li>
              Hands only appear on the hour that's actually happening, so a face
              never shows a time it doesn't cover.
            </li>
            <li>
              Underneath, the current block counts down and the rest of the day
              lists what's coming and when.
            </li>
            <li>A chime plays when the last block ends. Back returns here.</li>
          </ul>
        </div>

        <p className="text-sm">
          Your schedule is saved in this browser when you press Submit, so it's
          still here tomorrow.
        </p>

        <button
          className="text-sm text-gray-500 hover:text-gray-300 border rounded-sm p-1 self-center"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
