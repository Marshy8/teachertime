import { useRef } from "react";
import Papa from "papaparse";
import { type BlockData } from "../data/BlockData";

export function CsvControl(blocks: BlockData[]) {
  type ImportedBlock = {
    id: string;
    name: string;
    color: string;
    duration: number;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    Papa.parse<ImportedBlock>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const importedBlocks = result.data.map((block) => ({
          ...block,
          duration: Number(block.duration),
        }));

        console.log("imported", importedBlocks);

        // setBlocks(importedBlocks);
      },
      error: (error) => {
        console.error("CSV import failed:", error);
      },
    });

    event.target.value = "";
  };

  return (
    <div className='grid grid-cols-2 items-center flex gap-3'>
      <input
        ref={fileInputRef}
        type='file'
        accept='.csv,text/csv'
        className='hidden'
        onChange={handleImportCsv}
      />

      <button
        type='button'
        className='text-xs text-gray-400 hover:text-white border rounded-sm p-1 disabled:text-gray-400 disabled:hover:text-gray-400 justify-self-end'
        onClick={() => fileInputRef.current?.click()}
      >
        Import CSV
      </button>
      <button
        className='text-xs text-gray-400 hover:text-white border rounded-sm p-1 disabled:text-gray-400 disabled:hover:text-gray-400 justify-self-end'
        onClick={() => {
          const escapeCsvValue = (value: string | null | undefined) => {
            const stringValue = String(value ?? "");

            // Escape quotes by doubling them, then wrap the value in quotes
            return `"${stringValue.replace(/"/g, '""')}"`;
          };

          const csvHeader = ["ID", "Name", "Color", "Duration"]
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
          link.download = `TeacherTime-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);
        }}
      >
        Export as CSV
      </button>
    </div>
  );
}
