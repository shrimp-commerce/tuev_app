import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { api } from "../trpc/react";
import { Alert, AlertTitle } from "./ui/alert";
import { Card, CardContent } from "./ui/card";
dayjs.extend(utc);

import { Pen } from "lucide-react";
import { useEffect } from "react";
import { EditTaskDialog } from "./editTaskDialog";

interface TaskListProps {
  selectedDate: dayjs.Dayjs;
}

const TaskList: React.FC<TaskListProps> = ({ selectedDate }) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const t = useTranslations("TaskList");
  const selectedDateUTC = dayjs
    .utc(selectedDate.format("YYYY-MM-DD"))
    .startOf("day")
    .toDate();
  const { data, isLoading, error } = api.adminTask.getAllForDay.useQuery({
    date: selectedDateUTC,
  });
  const updateTask = api.adminTask.update.useMutation({
    onSuccess: async () => {
      await utils.adminTask.invalidate();
      setEditingTaskId(null);
    },
  });
  const { data: users, isLoading: loadingUsers } =
    api.admin.getAllUsers.useQuery();

  // Prefetch previous and next day for faster navigation
  const utils = api.useUtils();
  useEffect(() => {
    const prevDay = dayjs(selectedDate).subtract(1, "day");
    const nextDay = dayjs(selectedDate).add(1, "day");
    void utils.adminTask.getAllForDay.prefetch({
      date: dayjs.utc(prevDay.format("YYYY-MM-DD")).startOf("day").toDate(),
    });
    void utils.adminTask.getAllForDay.prefetch({
      date: dayjs.utc(nextDay.format("YYYY-MM-DD")).startOf("day").toDate(),
    });
  }, [selectedDate, utils]);

  return (
    <ul className="flex flex-col gap-4">
      {isLoading ? (
        <Alert>
          <AlertTitle>{t("loading")}</AlertTitle>
        </Alert>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>
            {t("errorLoadingTasks")}:{" "}
            {error instanceof Error ? error.message : t("unknownError")}
          </AlertTitle>
        </Alert>
      ) : Array.isArray(data) && data.length > 0 ? (
        data.map((task) => (
          <Card key={task.id} className="w-full">
            <CardContent>
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {task.title}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {task.startTime
                      ? dayjs(task.startTime).format("HH:mm")
                      : "--"}
                    {" - "}
                    {task.endTime ? dayjs(task.endTime).format("HH:mm") : "--"}
                  </span>
                </div>
                <div
                  onClick={() => setEditingTaskId(String(task.id))}
                  className="cursor-pointer"
                >
                  <Pen size={16} />
                </div>
                {editingTaskId === String(task.id) && (
                  <EditTaskDialog
                    open={true}
                    onOpenChange={(open) => {
                      if (!open) setEditingTaskId(null);
                    }}
                    initialValues={{
                      assignedToId: task.assignedTo?.id,
                      date: dayjs(task.date).format("YYYY-MM-DD"),
                      description: task.description,
                      startTime: dayjs
                        .utc(task.startTime)
                        .local()
                        .format("HH:mm"),
                      endTime: dayjs.utc(task.endTime).local().format("HH:mm"),
                      title: task.title,
                    }}
                    users={users?.map(({ id, name, email }) => ({
                      id,
                      name: name ?? undefined,
                      email: email ?? undefined,
                    }))}
                    onSubmit={({
                      date,
                      startTime,
                      endTime,
                      description,
                      title,
                      assignedToId,
                    }) => {
                      // Compose UTC ISO strings using dayjs
                      const dateISO = date
                        ? dayjs.utc(date, "YYYY-MM-DD").toISOString()
                        : "";
                      console.log("date", date);
                      console.log("dateISO", dateISO);
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
                      updateTask.mutate({
                        id: task.id,
                        data: {
                          title,
                          date: dateISO,
                          startTime: startTimeISO,
                          endTime: endTimeISO,
                          description,
                          assignedToId,
                        },
                      });
                    }}
                    isPending={updateTask.isPending}
                    loadingUsers={loadingUsers}
                  />
                )}
              </div>
              <div className="mb-1 text-sm text-gray-700 dark:text-gray-300">
                {task.assignedTo?.name ?? task.assignedTo?.id ?? t("unknown")}
              </div>
              <div className="text-gray-800 dark:text-gray-200">
                {task.description}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Alert>
          <AlertTitle>{t("noTasksFound")}</AlertTitle>
        </Alert>
      )}
    </ul>
  );
};

export default TaskList;
