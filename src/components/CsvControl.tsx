import { useRef } from "react";
import Papa from "papaparse";
import type { BlockData } from "../data/BlockData";
import { saveSession } from "../data/storage";

type CsvControlProps = {
  blocks: BlockData[];
  onImport: (blocks: BlockData[]) => void;
};

function getRandomColor(): string {
  return "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
}

export function CsvControl({ blocks, onImport }: CsvControlProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    Papa.parse<BlockData>(file, {
      header: true,
      skipEmptyLines: true,

      complete: (result) => {
        if (result.errors.length > 0) {
          console.error("CSV import warnings:", result.errors);
        }

        const importedBlocks: BlockData[] = result.data.map((block) => ({
          id:
            typeof block.id === "string" && block.id.trim() !== ""
              ? block.id.trim()
              : crypto.randomUUID(),
          name: String(block.name ?? ""),
          color:
            typeof block.color === "string" && block.color.trim() !== ""
              ? block.color.trim()
              : getRandomColor(),
          duration: String(block.duration ?? ""),
        }));

        const importedSession = {
          blocks: importedBlocks,
          startTime: "",
        };

        saveSession(importedSession);

        // Updates the parent component's state
        onImport(importedBlocks);
      },

      error: (error) => {
        console.error("CSV import failed:", error);
      },
    });

    // Allows selecting the same file again later
    event.target.value = "";
  };

  const handleExportCsv = () => {
    const escapeCsvValue = (value: string | null | undefined) => {
      const stringValue = String(value ?? "");
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const csvHeader = ["id", "name", "color", "duration"]
      .map(escapeCsvValue)
      .join(",");

    const csvRows = blocks.map((block) =>
      [block.id, block.name, block.color, block.duration]
        .map(escapeCsvValue)
        .join(","),
    );

    const csvContent = [csvHeader, ...csvRows].join("\r\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `TeacherTime-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className='grid grid-cols-2 items-center gap-3'>
      <input
        ref={fileInputRef}
        type='file'
        accept='.csv,text/csv'
        className='hidden'
        onChange={handleImportCsv}
      />

      <button
        type='button'
        className='justify-self-end rounded-sm border p-1 text-xs text-gray-400 hover:text-white'
        onClick={() => fileInputRef.current?.click()}
      >
        Import CSV
      </button>

      <button
        type='button'
        className='justify-self-end rounded-sm border p-1 text-xs text-gray-400 hover:text-white'
        onClick={handleExportCsv}
      >
        Export as CSV
      </button>
    </div>
  );
}
