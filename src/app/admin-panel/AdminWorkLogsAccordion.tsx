"use client";

import type { User, WorkLog } from "@prisma/client";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Alert, AlertTitle } from "../../components/ui/alert";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";

import { useTranslations } from "next-intl";

type WorkLogWithUser = WorkLog & { createdBy: User };

export function AdminWorkLogsAccordion({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  const t = useTranslations("AdminPanel");
  const workLogsQuery = api.admin.getAllWorklogsForMonth.useQuery({
    year,
    month,
  });
  const utils = api.useUtils();
  const [grouped, setGrouped] = useState<Record<string, WorkLogWithUser[]>>({});

  useEffect(() => {
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    void utils.admin.getAllWorklogsForMonth.prefetch({
      year: prevYear,
      month: prevMonth,
    });
    void utils.admin.getAllWorklogsForMonth.prefetch({
      year: nextYear,
      month: nextMonth,
    });
  }, [month, year, utils]);

  useEffect(() => {
    if (workLogsQuery.data) {
      const byUser: Record<string, WorkLogWithUser[]> = {};
      for (const log of workLogsQuery.data as WorkLogWithUser[]) {
        const name = log.createdBy?.name ?? log.createdBy?.email ?? "Unknown";
        (byUser[name] ??= []).push(log);
      }
      setGrouped(byUser);
    }
  }, [workLogsQuery.data]);

  function groupWorkLogsByDate(
    workLogs: WorkLogWithUser[],
  ): Record<string, WorkLogWithUser[]> {
    return workLogs.reduce(
      (acc, log) => {
        const dateObj = new Date(log.date);
        const dayName = dateObj.toLocaleDateString(undefined, {
          weekday: "long",
        });
        const day = dateObj.getDate();
        const monthName = dateObj.toLocaleDateString(undefined, {
          month: "long",
        });
        const year = dateObj.getFullYear();
        const formattedDate = `${dayName}, ${day}. ${monthName} ${year}`;
        (acc[formattedDate] ??= []).push(log);
        return acc;
      },
      {} as Record<string, WorkLogWithUser[]>,
    );
  }

  if (workLogsQuery.isLoading)
    return (
      <Alert>
        <AlertTitle>{t("loading")}</AlertTitle>
      </Alert>
    );
  if (workLogsQuery.isError)
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("errorLoadingWorklogs")}</AlertTitle>
      </Alert>
    );
  return (
    <>
      {Object.keys(grouped).length === 0 ? (
        <Alert className="py-8 text-center">
          <AlertTitle>
            {t("noWorkLogsForMonth", {
              default:
                "There are no work logs for this month. Please check another month or ensure work logs have been submitted.",
            })}
          </AlertTitle>
        </Alert>
      ) : (
        <Accordion type="multiple" className="w-full">
          {Object.entries(grouped).map(([user, logs]) => (
            <AccordionItem key={user} value={user}>
              <AccordionTrigger>{user}</AccordionTrigger>
              <AccordionContent>
                {Object.entries(groupWorkLogsByDate(logs)).map(
                  ([date, logsForDate]) => (
                    <Card key={date} className="mb-4">
                      <CardContent className="py-4">
                        <h3 className="text-md mb-2 font-bold text-gray-700">
                          {date}
                        </h3>
                        <Separator className="my-2" />
                        {logsForDate.map((log) => (
                          <div
                            key={log.id}
                            className="mb-2 flex items-center gap-2 rounded border bg-white px-2 py-1 shadow-sm"
                          >
                            <span className="text-sm whitespace-nowrap text-gray-500">
                              {new Date(log.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {new Date(log.endTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="truncate text-gray-800">
                              {log.description}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ),
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </>
  );
}
