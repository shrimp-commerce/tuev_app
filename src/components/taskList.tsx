import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { api } from "../trpc/react";
import { Button } from "./ui/button";

const TaskList = () => {
  const t = useTranslations("TaskList");
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
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

  if (isLoading) return <div>{t("loading")}</div>;
  if (error)
    return (
      <div>
        {t("errorLoadingTasks")}:{" "}
        {error instanceof Error ? error.message : t("unknownError")}
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4 flex items-center justify-center gap-4">
        <Button variant="outline" onClick={handlePrevDay}>
          <ArrowLeft />
        </Button>
        <span className="text-lg font-semibold">
          {selectedDate.toLocaleDateString()}
        </span>
        <Button variant="outline" onClick={handleNextDay}>
          <ArrowRight />
        </Button>
      </div>
      <ul className="flex flex-col gap-4">
        {Array.isArray(data) && data.length > 0 ? (
          data.map((task) => (
            <li
              key={task.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
            >
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
            </li>
          ))
        ) : (
          <li className="text-gray-500 dark:text-gray-400">
            {t("noTasksFound")}
          </li>
        )}
      </ul>
    </div>
  );
};

export default TaskList;
