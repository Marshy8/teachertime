type FinishedModalProps = {
  onClose: () => void;
  onBackToSettings: () => void;
};

export function FinishedModal({
  onClose,
  onBackToSettings,
}: FinishedModalProps) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40">
      <div className="flex flex-col items-center gap-4 border rounded-sm p-6 bg-[var(--bg)]">
        <span className="text-2xl font-extrabold">Finished</span>
        <div className="flex gap-2">
          <button
            className="text-sm text-blue-500 hover:text-blue-300 border rounded-sm p-1"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="text-sm text-green-500 hover:text-green-300 border rounded-sm p-1"
            onClick={onBackToSettings}
          >
            Back to Settings
          </button>
        </div>
      </div>
    </div>
  );
}
