import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslations } from "next-intl";
import React from "react";
import { api } from "../trpc/react";
import { Alert, AlertTitle } from "./ui/alert";
import { Card, CardContent } from "./ui/card";
dayjs.extend(utc);

interface TaskListProps {
  selectedDate: dayjs.Dayjs;
}

const TaskList: React.FC<TaskListProps> = ({ selectedDate }) => {
  const t = useTranslations("TaskList");
  const selectedDateUTC = dayjs
    .utc(selectedDate.format("YYYY-MM-DD"))
    .startOf("day")
    .toDate();
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
                    ? dayjs(task.startTime).format("HH:mm")
                    : "--"}
                  {" - "}
                  {task.endTime ? dayjs(task.endTime).format("HH:mm") : "--"}
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
