"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "~/trpc/react";
import { AddTaskDialog } from "../../components/addTaskDialog";
import TaskList from "../../components/taskList";
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
        <AddTaskSection />
        <TaskList />
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
    createTask.mutate({
      title: values.title,
      date: new Date(values.date),
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
