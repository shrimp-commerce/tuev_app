"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { AdminWorkLogsAccordion } from "./AdminWorkLogsAccordion";

export default function AdminPanel() {
  const now = new Date();
  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(now.getMonth() + 1);

  const getMonthName = (month: number) =>
    new Date(displayYear, month - 1, 1).toLocaleDateString(undefined, {
      month: "long",
    });

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container flex flex-col items-center gap-12 px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight">Admin Panel</h1>
        <div className="mb-2 flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Previous month"
            onClick={() => {
              if (displayMonth === 1) {
                setDisplayMonth(12);
                setDisplayYear(displayYear - 1);
              } else {
                setDisplayMonth(displayMonth - 1);
              }
            }}
          >
            &#8592;
          </Button>
          <span className="text-lg font-bold">
            {getMonthName(displayMonth)} {displayYear}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Next month"
            onClick={() => {
              if (displayMonth === 12) {
                setDisplayMonth(1);
                setDisplayYear(displayYear + 1);
              } else {
                setDisplayMonth(displayMonth + 1);
              }
            }}
          >
            &#8594;
          </Button>
        </div>
        <AdminWorkLogsAccordion year={displayYear} month={displayMonth} />
      </div>
    </main>
  );
}
