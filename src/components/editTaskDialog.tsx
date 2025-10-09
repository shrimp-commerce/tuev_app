import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { TaskForm, type TaskFormValues } from "./TaskForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
  isPending?: boolean;
  users?: Array<{ id: string; name?: string; email?: string }>;
  loadingUsers?: boolean;
}

export function EditTaskDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  isPending,
  users,
  loadingUsers,
}: EditTaskDialogProps) {
  const t = useTranslations("AdminPanel");
  const [formValues, setFormValues] = useState<TaskFormValues>(initialValues);

  function handleFormChange(values: TaskFormValues) {
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
            {t("editTaskTitle", { default: "Edit Task" })}
          </DialogTitle>
        </DialogHeader>
        <TaskForm
          values={formValues}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
          isPending={isPending}
          t={t}
          users={users}
          loadingUsers={loadingUsers}
        />
      </DialogContent>
    </Dialog>
  );
}
