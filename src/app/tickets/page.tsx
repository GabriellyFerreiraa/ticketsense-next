"use client";
import { useState } from "react";

export default function TicketsPage() {
  const [count, setCount] = useState(0);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Tickets</h1>
      <button
        onClick={() => setCount(count + 1)}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Clicks: {count}
      </button>
    </main>
  );
}