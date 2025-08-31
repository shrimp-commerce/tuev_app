"use client";

import { useEffect, useState } from "react";

import type { WorkLog } from "@prisma/client";
import { AlertCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { Alert, AlertTitle } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";

export function LatestWorkLog() {
  const t = useTranslations("HomePage");
  const now = new Date();
  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(now.getMonth() + 1);
  const workLogs = api.workLog.getByMonth.useQuery({
    year: displayYear,
    month: displayMonth,
  });

  const utils = api.useUtils();
  const [description, setDescription] = useState("");
  // Get current date in yyyy-mm-dd format
  const nowDate = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const initialDate = `${nowDate.getFullYear()}-${pad(nowDate.getMonth() + 1)}-${pad(nowDate.getDate())}`;
  // Get current time in hh:mm format
  const initialTime = `${pad(nowDate.getHours())}:${pad(nowDate.getMinutes())}`;
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialTime);
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const createWorkLog = api.workLog.create.useMutation({
    onSuccess: async () => {
      await utils.workLog.invalidate();
      setDescription("");
      setDate("");
      setStartTime("");
      setEndTime("");
    },
  });

  // prefetch to make change of month feel instant
  useEffect(() => {
    let prevMonth = displayMonth - 1;
    let prevYear = displayYear;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    let nextMonth = displayMonth + 1;
    let nextYear = displayYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    void utils.workLog.getByMonth.prefetch({
      year: prevYear,
      month: prevMonth,
    });
    void utils.workLog.getByMonth.prefetch({
      year: nextYear,
      month: nextMonth,
    });
  }, [displayMonth, displayYear, utils]);

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

  type WorkLogWithFormatted = WorkLog & {
    formattedDate: string;
    startTimeFormatted: string;
    endTimeFormatted: string;
  };
  function groupWorkLogsByDate(
    workLogs: WorkLog[],
  ): Record<string, WorkLogWithFormatted[]> {
    return workLogs.reduce<Record<string, WorkLogWithFormatted[]>>(
      (acc, log) => {
        // Format date as 'Monday, 5. August 2025' in user's locale
        const dateObj = new Date(log.date);
        const dayName = dateObj.toLocaleDateString(undefined, {
          weekday: "long",
        });
        const day = dateObj.getDate();
        const monthName = dateObj.toLocaleDateString(undefined, {
          month: "long",
        });
        const year = dateObj.getFullYear();
        const formattedDate = `${dayName}, ${day}. ${monthName} ${year}`;
        // Format start and end time in user's locale and attach to log
        const formattedLog: WorkLogWithFormatted = {
          ...log,
          formattedDate,
          startTimeFormatted: new Date(log.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          endTimeFormatted: new Date(log.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        (acc[formattedDate] ??= []).push(formattedLog);
        return acc;
      },
      {},
    );
  }

  const getMonthName = (month: number) =>
    new Date(displayYear, month - 1, 1).toLocaleDateString(undefined, {
      month: "long",
    });

  return (
    <div className="mx-auto w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!description || !date || !startTime || !endTime) {
            setError("Please fill in all fields.");
            return;
          }
          setError("");
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
        className="mb-6 flex flex-col gap-2"
      >
        <Input
          type="text"
          placeholder={t("description")}
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
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
        <Button type="submit" disabled={createWorkLog.isPending}>
          {createWorkLog.isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
      <Separator className="my-4" />
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
      <div className="mb-6 flex flex-col gap-4">
        {workLogs.isLoading ? (
          <div className="animate-pulse text-gray-400">{t("loading")}</div>
        ) : workLogs.data && workLogs.data.length > 0 ? (
          Object.entries(groupWorkLogsByDate(workLogs.data)).map(
            ([date, logs]) => (
              <div key={date}>
                <h3 className="text-md font-bold text-gray-700">{date}</h3>
                <Separator className="my-2" />
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="mb-2 flex items-center gap-2 rounded border bg-white px-2 py-1 shadow-sm"
                  >
                    <span className="text-sm whitespace-nowrap text-gray-500">
                      {log.startTimeFormatted} - {log.endTimeFormatted}
                    </span>
                    <span className="truncate text-gray-800">
                      {log.description}
                    </span>
                  </div>
                ))}
              </div>
            ),
          )
        ) : (
          <p className="text-gray-500">{t("noWorkLogs")}</p>
        )}
      </div>
    </div>
  );
}
