import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslations } from "next-intl";
import React from "react";
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
}) => {
  const t = useTranslations("WeeksTasks");

  return (
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
  );
};

export default TaskWeekList;
