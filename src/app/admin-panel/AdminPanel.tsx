"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "~/trpc/react";
import { AddTaskDialog } from "../../components/addTaskDialog";
import TaskList from "../../components/taskList";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { AdminWorkLogsAccordion } from "./AdminWorkLogsAccordion";

export default function AdminPanel() {
  const t = useTranslations("AdminPanel");
  const now = new Date();
  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(now.getMonth() + 1);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const handlePrevDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
  };
  const handleNextDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
  };

  const getMonthName = (month: number) =>
    new Date(displayYear, month - 1, 1).toLocaleDateString(undefined, {
      month: "long",
    });

  return (
    <main className="bg-muted/50 min-h-screen w-full px-2 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("title", { default: "Admin Panel" })}
          </h1>
        </header>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="mb-2 text-xl font-semibold">
              {t("tasksForSelectedDay", { default: "Tasks for selected day" })}
            </h2>
            <div className="flex items-center justify-between gap-4">
              <Button variant="outline" onClick={handlePrevDay}>
                <ArrowLeft />
              </Button>
              <span className="text-md font-semibold">
                {selectedDate.toLocaleDateString("de-DE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <Button variant="outline" onClick={handleNextDay}>
                <ArrowRight />
              </Button>
            </div>
            <AddTaskSection />
            <TaskList selectedDate={selectedDate} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={t("previousMonth", { default: "Previous month" })}
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
                  aria-label={t("nextMonth", { default: "Next month" })}
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
              <h2 className="text-xl font-semibold">
                {t("workLogs", { default: "Work Logs" })}
              </h2>
            </div>
            <AdminWorkLogsAccordion year={displayYear} month={displayMonth} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function AddTaskSection() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const t = useTranslations("AdminPanel");
  const createTask = api.adminTask.create.useMutation({
    onSuccess: async () => {
      await utils.adminTask.invalidate();
      setOpen(false);
    },
  });

  function handleAddTask(values: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    assignedToId: string;
  }) {
    const utcMidnight = new Date(`${values.date}T00:00:00Z`);
    createTask.mutate({
      title: values.title,
      date: utcMidnight,
      startTime: new Date(`${values.date}T${values.startTime}`),
      endTime: new Date(`${values.date}T${values.endTime}`),
      description: values.description,
      assignedToId: values.assignedToId,
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="default">
        {t("addTaskButton")}
      </Button>
      <AddTaskDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleAddTask}
        isPending={createTask.isPending}
      />
    </>
  );
}
