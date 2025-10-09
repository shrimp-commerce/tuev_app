import React from "react";
import { Button } from "./ui/button";
import { DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface TaskFormValues {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  assignedToId: string;
}

export interface TaskFormProps {
  values: TaskFormValues;
  onChange: (values: TaskFormValues) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending?: boolean;
  t: (key: string) => string;
  users?: Array<{ id: string; name?: string; email?: string }>;
  loadingUsers?: boolean;
}

export function TaskForm({
  values,
  onChange,
  onSubmit,
  isPending,
  t,
  users,
  loadingUsers,
}: TaskFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <Input
        type="text"
        value={values.title}
        onChange={(e) => onChange({ ...values, title: e.target.value })}
        placeholder={t("taskTitle")}
        required
      />
      <Input
        type="date"
        value={values.date}
        onChange={(e) => onChange({ ...values, date: e.target.value })}
        placeholder={t("taskDate")}
        required
      />
      <Input
        type="time"
        value={values.startTime}
        onChange={(e) => onChange({ ...values, startTime: e.target.value })}
        placeholder={t("taskStartTime")}
        required
      />
      <Input
        type="time"
        value={values.endTime}
        onChange={(e) => onChange({ ...values, endTime: e.target.value })}
        placeholder={t("taskEndTime")}
        required
      />
      <Input
        type="text"
        value={values.description}
        onChange={(e) => onChange({ ...values, description: e.target.value })}
        placeholder={t("taskDescription")}
        required
      />
      <Select
        value={values.assignedToId}
        onValueChange={(val) => onChange({ ...values, assignedToId: val })}
        required
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("taskAssignedToId")} />
        </SelectTrigger>
        <SelectContent>
          {loadingUsers ? (
            <SelectItem value="" disabled>
              {t("loading")}
            </SelectItem>
          ) : (
            users?.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name ?? user.email ?? user.id}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {t("addTaskButton")}
        </Button>
      </DialogFooter>
    </form>
  );
}
