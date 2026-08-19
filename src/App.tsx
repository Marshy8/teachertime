import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { createBlock, type BlockData } from "./data/BlockData";
import { loadSession } from "./data/storage";
import { Clock } from "./pages/Clock";
import { Settings } from "./pages/Settings";

const DEFAULT_COLORS = ["#2173c0", "#13d443", "#df7f11"];

function defaultBlocks(): BlockData[] {
  return DEFAULT_COLORS.map((color) => createBlock(color));
}

function App() {
  // Read once at mount; a missing or unusable session falls back to defaults.
  const [saved] = useState(loadSession);

  // Held above the routes so the schedule survives navigating between pages.
  const [blocks, setBlocks] = useState<BlockData[]>(
    () => saved?.blocks ?? defaultBlocks(),
  );
  const [startTime, setStartTime] = useState(() => saved?.startTime ?? "");

  // Resolved to an absolute instant by Settings on Submit, so the Clock page
  // never has to invent a start of its own.
  const [start, setStart] = useState<number | null>(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Settings
              blocks={blocks}
              setBlocks={setBlocks}
              startTime={startTime}
              setStartTime={setStartTime}
              setStart={setStart}
            />
          }
        />
        <Route
          path="/clock"
          element={
            // Reloading straight onto /clock has no start time to run from,
            // so send the teacher back to press Submit again.
            start === null ? (
              <Navigate to="/" replace />
            ) : (
              <Clock blocks={blocks} start={start} />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
