"use client";

import dayjs from "dayjs";
import "dayjs/locale/de";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "~/trpc/react";
import { AddTaskDialog } from "../../components/addTaskDialog";
import TaskList from "../../components/taskList";
import TaskWeekList from "../../components/taskWeekList";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { AdminWorkLogsAccordion } from "./AdminWorkLogsAccordion";

export default function AdminPanel() {
  const t = useTranslations("AdminPanel");
  const now = dayjs();
  const [displayYear, setDisplayYear] = useState(now.year());
  const [displayMonth, setDisplayMonth] = useState(now.month() + 1);
  const [selectedDate, setSelectedDate] = useState(() => now.startOf("day"));
  const [weekOffset, setWeekOffset] = useState(0);

  const selectedWeekDateUTC = dayjs
    .utc(selectedDate.format("YYYY-MM-DD"))
    .startOf("day")
    .toDate();
  const {
    data: weekTasks,
    isLoading: isLoadingWeek,
    error: errorWeek,
  } = api.adminTask.getAllForWeek.useQuery({
    date: selectedWeekDateUTC,
    offset: weekOffset,
  });

  let weekStart = dayjs(selectedWeekDateUTC)
    .add(weekOffset, "week")
    .startOf("week");
  if (weekStart.day() !== 1) {
    weekStart = weekStart.day(1);
  }
  const weekEnd = weekStart.add(6, "day");
  const selectedDateUTC = dayjs
    .utc(selectedDate.format("YYYY-MM-DD"))
    .startOf("day")
    .toDate();
  const {
    data: tasks,
    isLoading,
    error: error,
  } = api.adminTask.getAllForDay.useQuery({
    date: selectedDateUTC,
  });
  const { data: users, isLoading: loadingUsers } =
    api.admin.getAllUsers.useQuery();

  const utils = api.useUtils();
  const updateTask = api.adminTask.update.useMutation({
    onSuccess: async () => {
      await utils.adminTask.invalidate();
    },
  });

  const handleEditTask = (
    taskId: string,
    data: {
      title: string;
      date: string;
      startTime: string;
      endTime: string;
      description?: string;
      assignedToId?: string;
    },
  ) => {
    updateTask.mutate({
      id: Number(taskId),
      data: {
        ...data,
        description: data.description ?? "",
        assignedToId: data.assignedToId ?? "",
      },
    });
  };

  const handlePrevDay = () => {
    setSelectedDate((prev) => prev.subtract(1, "day"));
  };
  const handleNextDay = () => {
    setSelectedDate((prev) => prev.add(1, "day"));
  };

  const getMonthName = (month: number) =>
    dayjs()
      .year(displayYear)
      .month(month - 1)
      .locale("de")
      .format("MMMM");

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
                {selectedDate.locale("de").format("dddd, D. MMMM YYYY")}
              </span>
              <Button variant="outline" onClick={handleNextDay}>
                <ArrowRight />
              </Button>
            </div>
            <AddTaskSection />
            <TaskList
              tasks={tasks}
              users={users}
              loading={isLoading}
              error={error?.message ? new Error(error.message) : null}
              onEditTask={handleEditTask}
              isPending={updateTask.isPending}
              loadingUsers={loadingUsers}
              admin={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="mb-2 text-xl font-semibold">
              {t("tasksForSelectedWeek", {
                default: "Tasks for selected week",
              })}
            </h2>
            <div className="mb-4 flex gap-2">
              <Button onClick={() => setWeekOffset((o) => o - 1)}>
                {t("previousWeek", { default: "Previous week" })}
              </Button>
              <Button
                onClick={() => setWeekOffset(0)}
                disabled={weekOffset === 0}
              >
                {t("currentWeek", { default: "Current week" })}
              </Button>
              <Button onClick={() => setWeekOffset((o) => o + 1)}>
                {t("nextWeek", { default: "Next week" })}
              </Button>
            </div>
            <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-300">
              {weekStart.format("DD.MM.YYYY")} - {weekEnd.format("DD.MM.YYYY")}
            </div>
            <TaskWeekList
              data={weekTasks}
              loading={isLoadingWeek}
              error={errorWeek}
            />
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
    // All values are strings, convert to ISO strings for mutation
    const dateISO = dayjs(`${values.date}T00:00:00Z`).toISOString();
    const startTimeISO = dayjs(
      `${values.date}T${values.startTime}`,
    ).toISOString();
    const endTimeISO = dayjs(`${values.date}T${values.endTime}`).toISOString();
    createTask.mutate({
      title: values.title,
      date: dateISO,
      startTime: startTimeISO,
      endTime: endTimeISO,
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
