import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createBlock, type BlockData } from "./data/BlockData";
import { Clock } from "./pages/Clock";
import { Settings } from "./pages/Settings";

const DEFAULT_COLORS = ["#2173c0", "#13d443", "#df7f11"];

function App() {
  // Held above the routes so the schedule survives navigating between pages.
  const [blocks, setBlocks] = useState<BlockData[]>(() =>
    DEFAULT_COLORS.map((color) => createBlock(color)),
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Settings blocks={blocks} setBlocks={setBlocks} />}
        />
        <Route path="/clock" element={<Clock blocks={blocks} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
