import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    assignedToId: string;
  }) => void;
  isPending?: boolean;
}

export function AddTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AddTaskDialogProps) {
  const t = useTranslations("AdminPanel");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const { data: users, isLoading: loadingUsers } =
    api.admin.getAllUsers.useQuery();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ title, date, startTime, endTime, description, assignedToId });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("addTaskTitle", { default: "Add New Task" })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("taskTitle", { default: "Title" })}
            required
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder={t("taskDate", { default: "Date" })}
            required
          />
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder={t("taskStartTime", { default: "Start Time" })}
            required
          />
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder={t("taskEndTime", { default: "End Time" })}
            required
          />
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("taskDescription", { default: "Description" })}
            required
          />
          <Select value={assignedToId} onValueChange={setAssignedToId} required>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={t("taskAssignedToId", {
                  default: "Assigned To",
                })}
              />
            </SelectTrigger>
            <SelectContent>
              {loadingUsers ? (
                <SelectItem value="" disabled>
                  {t("loading", { default: "Loading..." })}
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
              {t("addTaskButton", { default: "Add Task" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
