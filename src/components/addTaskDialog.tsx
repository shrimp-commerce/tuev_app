import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "~/trpc/react";
import { TaskForm } from "./TaskForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

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
  const [formValues, setFormValues] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    assignedToId: "",
  });
  const { data: users, isLoading: loadingUsers } =
    api.admin.getAllUsers.useQuery();

  function handleFormChange(values: typeof formValues) {
    setFormValues(values);
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(formValues);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("addTaskTitle", { default: "Add New Task" })}
          </DialogTitle>
        </DialogHeader>
        <TaskForm
          values={formValues}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
          isPending={isPending}
          t={t}
          users={users?.map(({ id, name, email }) => ({
            id,
            name: name ?? undefined,
            email: email ?? undefined,
          }))}
          loadingUsers={loadingUsers}
        />
      </DialogContent>
    </Dialog>
  );
}
