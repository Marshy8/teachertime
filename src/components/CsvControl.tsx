import { useRef } from "react";
import Papa from "papaparse";
import type { BlockData } from "../data/BlockData";
import { saveSession } from "../data/storage";

type CsvControlProps = {
  blocks: BlockData[];
  startTime: string;
  onImport: (startTime: string, blocks: BlockData[]) => void;
};

function getRandomColor(): string {
  return "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
}

export function CsvControl({ blocks, startTime, onImport }: CsvControlProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportCsv = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file || file.size === 0) return; // if the file is empty or not selected, do nothing

    const text = await file.text();

    if (!text.trim()) return; // if the file is empty or only whitespace, do nothing

    const [firstLine = "", ...rest] = text.split(/\r?\n/); // gets the 1st line then passes it to papaparse to parse the rest of the csv
    const importedStartTime: string | undefined = firstLine.split(",")[1];

    Papa.parse<BlockData>(rest.join("\n"), {
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
          startTime: importedStartTime,
        };

        saveSession(importedSession);

        // Updates the parent component's state
        onImport(importedStartTime, importedBlocks);
      },

      error: (error: Error) => {
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

    const csvStartTime = "startTime," + startTime;
    console.log("Exporting CSV with start time:", csvStartTime);
    const csvHeader = ["id", "name", "color", "duration"]
      .map(escapeCsvValue)
      .join(",");

    const csvRows = blocks.map((block) =>
      [block.id, block.name, block.color, block.duration]
        .map(escapeCsvValue)
        .join(","),
    );

    const csvContent = [csvStartTime, csvHeader, ...csvRows].join("\r\n");

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
