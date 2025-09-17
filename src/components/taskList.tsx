import { useTranslations } from "next-intl";
import React from "react";
import { api } from "../trpc/react";
import { Alert, AlertTitle } from "./ui/alert";
import { Card, CardContent } from "./ui/card";

interface TaskListProps {
  selectedDate: Date;
}

const TaskList: React.FC<TaskListProps> = ({ selectedDate }) => {
  const t = useTranslations("TaskList");
  // Convert selectedDate to UTC midnight for the query
  const selectedDateUTC = new Date(
    Date.UTC(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0,
      0,
      0,
      0,
    ),
  );
  const { data, isLoading, error } = api.adminTask.getAllForDay.useQuery({
    date: selectedDateUTC,
  });

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
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {task.title}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {task.startTime
                    ? new Date(task.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                  {" - "}
                  {task.endTime
                    ? new Date(task.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                </span>
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
