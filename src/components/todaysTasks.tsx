"use client";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslations } from "next-intl";
import React from "react";
import { api } from "../trpc/react";
import TaskList from "./taskList";
dayjs.extend(utc);

const TodaysTasks: React.FC = () => {
  const nowStartOfDay = dayjs().startOf("day");
  const selectedDateUTC = dayjs
    .utc(nowStartOfDay.format("YYYY-MM-DD"))
    .startOf("day")
    .toDate();
  const { data, isLoading, error } = api.userTask.getAllForDay.useQuery({
    date: selectedDateUTC,
  });
  const t = useTranslations("TodaysTasks");
  return (
    <div>
      <h2>{t("title")}</h2>
      <TaskList
        tasks={data}
        loading={isLoading}
        error={error?.message ? new Error(error.message) : null}
        admin={false}
      />
    </div>
  );
};

export default TodaysTasks;
