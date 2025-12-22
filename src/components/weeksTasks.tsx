"use client";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslations } from "next-intl";

import React, { useState } from "react";
import { api } from "../trpc/react";
import TaskWeekList from "./taskWeekList";
import { Button } from "./ui/button";
dayjs.extend(utc);

const WeeksTasks: React.FC = () => {
  const [offset, setOffset] = useState(0);
  const nowStartOfDay = dayjs().startOf("day");
  const selectedDateUTC = dayjs
    .utc(nowStartOfDay.format("YYYY-MM-DD"))
    .startOf("day")
    .toDate();
  const { data, isLoading, error } = api.userTask.getAllForWeek.useQuery({
    date: selectedDateUTC,
    offset,
  });
  const t = useTranslations("WeeksTasks");
  console.log("data", data);
  let weekStart = dayjs(selectedDateUTC).add(offset, "week").startOf("week");
  if (weekStart.day() !== 1) {
    weekStart = weekStart.day(1);
  }
  const weekEnd = weekStart.add(6, "day");

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">{t("title")}</h2>
      <div className="mb-4 flex gap-2">
        <Button onClick={() => setOffset((o) => o - 1)}>
          {t("previousWeek")}
        </Button>
        <Button onClick={() => setOffset(0)} disabled={offset === 0}>
          {t("currentWeek")}
        </Button>
        <Button onClick={() => setOffset((o) => o + 1)}>{t("nextWeek")}</Button>
      </div>
      <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-300">
        {weekStart.format("DD.MM.YYYY")} - {weekEnd.format("DD.MM.YYYY")}
      </div>
      <TaskWeekList data={data} loading={isLoading} error={error} />
    </div>
  );
};

export default WeeksTasks;
