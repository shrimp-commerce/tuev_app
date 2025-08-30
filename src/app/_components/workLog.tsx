"use client";

import { useState } from "react";

import { api } from "~/trpc/react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function LatestWorkLog() {
  const latestWorkLog = api.workLog.getLatest.useQuery();

  const utils = api.useUtils();
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const createWorkLog = api.workLog.create.useMutation({
    onSuccess: async () => {
      await utils.workLog.invalidate();
      setDescription("");
      setDate("");
      setStartTime("");
      setEndTime("");
    },
  });

  function toUTCISOString(dateStr: string, timeStr: string) {
    if (!dateStr || !timeStr) return "";
    const dateParts = dateStr.split("-");
    const timeParts = timeStr.split(":");
    if (dateParts.length !== 3 || timeParts.length !== 2) return "";
    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]);
    const day = Number(dateParts[2]);
    const hour = Number(timeParts[0]);
    const minute = Number(timeParts[1]);
    if ([year, month, day, hour, minute].some(isNaN)) return "";
    const d = new Date(Date.UTC(year, month - 1, day, hour, minute));
    return d.toISOString();
  }

  return (
    <div className="w-full max-w-xs">
      {latestWorkLog ? (
        <p className="truncate">
          Your most recent work log: {latestWorkLog?.data?.description}
          <br />
          date:{" "}
          {latestWorkLog?.data?.date
            ? new Date(latestWorkLog.data.date).toLocaleDateString()
            : "-"}
          <br />
          startTime:{" "}
          {latestWorkLog?.data?.startTime
            ? new Date(latestWorkLog.data.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
          <br />
          endTime:{" "}
          {latestWorkLog?.data?.endTime
            ? new Date(latestWorkLog.data.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </p>
      ) : (
        <p>You have no work logs yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Compose UTC ISO strings
          const dateISO = date ? new Date(date).toISOString() : "";
          const startTimeISO = toUTCISOString(date, startTime);
          const endTimeISO = toUTCISOString(date, endTime);
          createWorkLog.mutate({
            description,
            date: dateISO,
            startTime: startTimeISO,
            endTime: endTimeISO,
          });
        }}
        className="flex flex-col gap-2"
      >
        <Input
          type="text"
          placeholder="Title"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <Input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <Button type="submit" disabled={createWorkLog.isPending}>
          {createWorkLog.isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}
