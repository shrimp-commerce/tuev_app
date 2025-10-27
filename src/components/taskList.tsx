import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Alert, AlertTitle } from "./ui/alert";
import { Card, CardContent } from "./ui/card";
dayjs.extend(utc);

import type { Task } from "@prisma/client";
import { Pen } from "lucide-react";
import type { User } from "../lib/types";
import { EditTaskDialog } from "./editTaskDialog";

interface TaskListProps {
  tasks?: (Task & { assignedTo?: User | null })[];
  users?: User[];
  loading?: boolean;
  error?: Error | null;
  onEditTask?: (
    taskId: string,
    data: {
      title: string;
      date: string;
      startTime: string;
      endTime: string;
      description?: string;
      assignedToId?: string;
    },
  ) => void;
  isPending?: boolean;
  loadingUsers?: boolean;
  admin?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  users,
  loading = false,
  error = null,
  onEditTask,
  isPending = false,
  loadingUsers = false,
  admin = false,
}) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const t = useTranslations("TaskList");

  return (
    <ul className="flex flex-col gap-4">
      {loading ? (
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
      ) : Array.isArray(tasks) && tasks.length > 0 ? (
        tasks.map((task) => (
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
                {admin && (
                  <>
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
                          assignedToId: task.assignedTo?.id ?? "",
                          date: dayjs(task.date).format("YYYY-MM-DD"),
                          description: task.description ?? "",
                          startTime: task.startTime
                            ? dayjs.utc(task.startTime).local().format("HH:mm")
                            : "",
                          endTime: task.endTime
                            ? dayjs.utc(task.endTime).local().format("HH:mm")
                            : "",
                          title: task.title,
                        }}
                        users={users?.map(({ id, name, email }) => ({
                          id: String(id),
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
                          if (onEditTask) {
                            // Compose UTC ISO strings using dayjs
                            const dateISO = date
                              ? dayjs.utc(date, "YYYY-MM-DD").toISOString()
                              : "";
                            const startParts = startTime
                              ? startTime.split(":")
                              : [];
                            const endParts = endTime ? endTime.split(":") : [];
                            const startTimeISO =
                              date && startParts.length === 2
                                ? dayjs(date)
                                    .hour(Number(startParts[0]))
                                    .minute(Number(startParts[1]))
                                    .second(0)
                                    .millisecond(0)
                                    .utc()
                                    .toISOString()
                                : "";
                            const endTimeISO =
                              date && endParts.length === 2
                                ? dayjs(date)
                                    .hour(Number(endParts[0]))
                                    .minute(Number(endParts[1]))
                                    .second(0)
                                    .millisecond(0)
                                    .utc()
                                    .toISOString()
                                : "";
                            onEditTask(String(task.id), {
                              title,
                              date: dateISO,
                              startTime: startTimeISO,
                              endTime: endTimeISO,
                              description,
                              assignedToId,
                            });
                          }
                        }}
                        isPending={isPending}
                        loadingUsers={loadingUsers}
                      />
                    )}
                  </>
                )}
              </div>
              {admin && (
                <div className="mb-1 text-sm text-gray-700 dark:text-gray-300">
                  {task.assignedTo?.name ?? task.assignedTo?.id ?? t("unknown")}
                </div>
              )}
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
