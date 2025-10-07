"use client";

import { useEffect, useState } from "react";

import type { WorkLog } from "@prisma/client";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/de";
import localizedFormat from "dayjs/plugin/localizedFormat";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import { AlertCircleIcon, CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { ConfirmButton } from "../../components/confirmButton";
import { EditWorkLogDialog } from "../../components/editWorkLogDialog";
import { Alert, AlertTitle } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Separator } from "../../components/ui/separator";
dayjs.extend(localizedFormat);
dayjs.extend(weekday);
dayjs.extend(updateLocale);
dayjs.extend(utc);

export function WorkLogs() {
  const t = useTranslations("HomePage");
  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [editLog, setEditLog] = useState<WorkLogWithFormatted | null>(null);
  const updateWorkLog = api.workLog.update.useMutation({
    onSuccess: async () => {
      await utils.workLog.invalidate();
      setEditDialogOpen(false);
      setEditLog(null);
    },
  });

  const now = dayjs();
  const [displayYear, setDisplayYear] = useState<number>(now.year());
  const [displayMonth, setDisplayMonth] = useState<number>(now.month() + 1);
  const workLogs = api.workLog.getByMonth.useQuery({
    year: displayYear,
    month: displayMonth,
  });

  const utils = api.useUtils();
  const [description, setDescription] = useState("");
  const deleteWorkLog = api.workLog.delete.useMutation({
    onSuccess: async () => {
      await utils.workLog.invalidate();
    },
  });
  // Use dayjs object for Calendar
  const nowDate = dayjs();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const initialTime = `${pad(nowDate.hour())}:${pad(nowDate.minute())}`;
  const [date, setDate] = useState<Dayjs | undefined>(nowDate);
  const [startTime, setStartTime] = useState(initialTime);
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const createWorkLog = api.workLog.create.useMutation({
    onSuccess: async () => {
      await utils.workLog.invalidate();
      setDescription("");
      setDate(undefined);
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
        const dateObj = dayjs(log.date).locale("de");
        const dayName = dateObj.format("dddd");
        const day = dateObj.date();
        const monthName = dateObj.format("MMMM");
        const year = dateObj.year();
        const formattedDate = `${dayName}, ${day}. ${monthName} ${year}`;
        // Format start and end time in user's locale and attach to log
        const formattedLog: WorkLogWithFormatted = {
          ...log,
          formattedDate,
          startTimeFormatted: dayjs.utc(log.startTime).local().format("HH:mm"),
          endTimeFormatted: dayjs.utc(log.endTime).local().format("HH:mm"),
        };
        (acc[formattedDate] ??= []).push(formattedLog);
        return acc;
      },
      {},
    );
  }

  const getMonthName = (month: number) =>
    dayjs()
      .year(displayYear)
      .month(month - 1)
      .locale("de")
      .format("MMMM");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!description || !date || !startTime || !endTime) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    // Compose UTC ISO strings using dayjs
    // Combine date and time as local, then convert to UTC ISO
    const dateISO = date ? date.toISOString() : "";
    const startTimeISO =
      date && startTime
        ? date
            .hour(Number(startTime.split(":")[0]))
            .minute(Number(startTime.split(":")[1]))
            .second(0)
            .millisecond(0)
            .utc()
            .toISOString()
        : "";
    const endTimeISO =
      date && endTime
        ? date
            .hour(Number(endTime.split(":")[0]))
            .minute(Number(endTime.split(":")[1]))
            .second(0)
            .millisecond(0)
            .utc()
            .toISOString()
        : "";
    createWorkLog.mutate({
      description,
      date: dateISO,
      startTime: startTimeISO,
      endTime: endTimeISO,
    });
  }

  return (
    <div className="w-full">
      <span className="text-md block pb-4">{t("quickTimeTracking")}</span>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <div className="flex w-full flex-col gap-3">
          <Label htmlFor="date" className="px-1">
            <CalendarIcon size={16} /> {t("dateLabel")}
          </Label>
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-full justify-between font-normal"
              >
                {date ? dayjs(date).format("D.M.YYYY") : "Select date"}
                <CalendarIcon size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date ? date.toDate() : undefined}
                captionLayout="dropdown"
                onSelect={(date) => {
                  setDate(date ? dayjs(date) : undefined);
                  setDatePopoverOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-row gap-2">
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
        </div>
        <Input
          type="text"
          placeholder={t("description")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          <Alert>
            <AlertTitle>{t("loading")}</AlertTitle>
          </Alert>
        ) : workLogs.data && workLogs.data.length > 0 ? (
          Object.entries(groupWorkLogsByDate(workLogs.data)).map(
            ([date, logs]) => (
              <Card key={date} className="mb-4">
                <CardContent className="py-4">
                  <h3 className="text-sm font-bold">{date}</h3>
                  <Separator className="mb-2" />
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="mb-2 flex items-center justify-between gap-2 rounded border bg-white px-2 py-1 shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-sm whitespace-nowrap text-gray-500">
                          {log.startTimeFormatted} - {log.endTimeFormatted}
                        </span>
                        <span className="truncate text-gray-800">
                          {log.description}
                        </span>
                      </div>
                      <div className="flex flex-shrink-0 flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditDialogOpen(true);
                            setEditLog(log);
                          }}
                          disabled={deleteWorkLog.isPending}
                        >
                          {t("edit")}
                        </Button>
                        <ConfirmButton
                          label={t("delete")}
                          confirmLabel={t("confirmDeleteLabel")}
                          onConfirm={() => deleteWorkLog.mutate({ id: log.id })}
                          disabled={deleteWorkLog.isPending}
                        />
                      </div>
                      {/* Edit WorkLog Dialog */}
                      {editLog && (
                        <EditWorkLogDialog
                          open={editDialogOpen}
                          onOpenChange={(open: boolean) => {
                            setEditDialogOpen(open);
                            if (!open) setEditLog(null);
                          }}
                          initialValues={{
                            date:
                              (() => {
                                if (typeof editLog.date === "string") {
                                  // If ISO string, extract date part
                                  const dateStr: string = editLog.date ?? "";
                                  const isoMatch = /^\d{4}-\d{2}-\d{2}/.exec(
                                    dateStr,
                                  );
                                  return isoMatch ? isoMatch[0] : "";
                                }
                                if (editLog.date instanceof Date) {
                                  return dayjs(editLog.date).format(
                                    "YYYY-MM-DD",
                                  );
                                }
                                return "";
                              })() ?? "",
                            startTime: dayjs
                              .utc(editLog.startTime)
                              .local()
                              .format("HH:mm"),
                            endTime: dayjs
                              .utc(editLog.endTime)
                              .local()
                              .format("HH:mm"),
                            description: editLog.description,
                          }}
                          onSubmit={({
                            date,
                            startTime,
                            endTime,
                            description,
                          }: {
                            date: string;
                            startTime: string;
                            endTime: string;
                            description: string;
                          }) => {
                            // Compose UTC ISO strings using dayjs
                            const dateISO = date
                              ? dayjs(date).toISOString()
                              : "";
                            const startTimeISO =
                              date && startTime
                                ? dayjs(date)
                                    .hour(Number(startTime.split(":")[0]))
                                    .minute(Number(startTime.split(":")[1]))
                                    .second(0)
                                    .millisecond(0)
                                    .utc()
                                    .toISOString()
                                : "";
                            const endTimeISO =
                              date && endTime
                                ? dayjs(date)
                                    .hour(Number(endTime.split(":")[0]))
                                    .minute(Number(endTime.split(":")[1]))
                                    .second(0)
                                    .millisecond(0)
                                    .utc()
                                    .toISOString()
                                : "";
                            updateWorkLog.mutate({
                              id: editLog.id,
                              date: dateISO,
                              startTime: startTimeISO,
                              endTime: endTimeISO,
                              description,
                            });
                          }}
                          isPending={updateWorkLog.isPending}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ),
          )
        ) : (
          <Alert>
            <AlertTitle>{t("noWorkLogs")}</AlertTitle>
          </Alert>
        )}
      </div>
    </div>
  );
}
