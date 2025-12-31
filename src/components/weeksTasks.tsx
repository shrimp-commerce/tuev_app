"use client";

import React from "react";
import { api } from "../trpc/react";
import TaskWeekList from "./taskWeekList";

import dayjs from "dayjs";
import { useState } from "react";

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

  let weekStart = dayjs(selectedDateUTC).add(offset, "week").startOf("week");
  if (weekStart.day() !== 1) {
    weekStart = weekStart.day(1);
  }
  const weekEnd = weekStart.add(6, "day");

  return (
    <div>
      <TaskWeekList
        data={data}
        loading={isLoading}
        error={error}
        weekStart={weekStart.format("DD.MM.YYYY")}
        weekEnd={weekEnd.format("DD.MM.YYYY")}
        onPrevWeek={() => setOffset((o) => o - 1)}
        onNextWeek={() => setOffset((o) => o + 1)}
        onCurrentWeek={() => setOffset(0)}
        disableCurrentWeek={offset === 0}
      />
    </div>
  );
};

export default WeeksTasks;
