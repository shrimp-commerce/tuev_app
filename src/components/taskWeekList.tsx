import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslations } from "next-intl";
import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
dayjs.extend(utc);

import type { Task } from "@prisma/client";

interface TaskWeekListProps {
  data?: Record<
    string,
    (Task & { assignedTo?: { name: string | null } | null })[]
  >;
  loading?: boolean;
  error?: unknown;
  title?: string;
  weekStart?: string;
  weekEnd?: string;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onCurrentWeek?: () => void;
  disableCurrentWeek?: boolean;
}

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const TaskWeekList: React.FC<TaskWeekListProps> = ({
  data,
  loading = false,
  error = null,
  title,
  weekStart,
  weekEnd,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  disableCurrentWeek = false,
}) => {
  const t = useTranslations("WeeksTasks");

  return (
    <div>
      {title && <h2 className="mb-4 text-xl font-bold">{title}</h2>}
      <div className="mb-4 flex gap-2">
        <Button onClick={onPrevWeek}>{t("previousWeek")}</Button>
        <Button onClick={onCurrentWeek} disabled={disableCurrentWeek}>
          {t("currentWeek")}
        </Button>
        <Button onClick={onNextWeek}>{t("nextWeek")}</Button>
      </div>
      {weekStart && weekEnd && (
        <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-300">
          {weekStart} - {weekEnd}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {daysOfWeek.map((day) => (
                <th
                  key={day}
                  className="border-b p-1 text-center font-semibold"
                  style={{ minWidth: 120, maxWidth: 150, width: 130 }}
                >
                  {t(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {daysOfWeek.map((day) => (
                <td
                  key={day}
                  className="border-r p-1 align-top last:border-r-0"
                  style={{ minWidth: 120, maxWidth: 150, width: 130 }}
                >
                  {loading ? (
                    <div className="text-sm">{t("loading")}</div>
                  ) : error ? (
                    <div className="text-red-500">{t("errorLoadingTasks")}</div>
                  ) : (data?.[day] ?? []).length > 0 ? (
                    <ul className="flex flex-col gap-2">
                      {(data?.[day] ?? []).map((task) => (
                        <li key={task.id}>
                          <Card className="w-full py-2">
                            <CardContent className="px-3">
                              <div className="text-sm font-semibold">
                                {task.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {task.startTime
                                  ? dayjs(task.startTime).format("HH:mm")
                                  : "--"}
                                {" - "}
                                {task.endTime
                                  ? dayjs(task.endTime).format("HH:mm")
                                  : "--"}
                              </div>
                              {task.assignedTo?.name && (
                                <div className="text-xs text-gray-400">
                                  {task.assignedTo.name}
                                </div>
                              )}
                              {task.description && (
                                <div className="mt-1 text-xs">
                                  {task.description}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-gray-400">
                      {t("noTasksFound")}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskWeekList;
