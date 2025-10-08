import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import type { WorkLogFormValues } from "./WorkLogForm";
import { WorkLogForm } from "./WorkLogForm";

export interface EditWorkLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: {
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  };
  onSubmit: (values: {
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  }) => void;
  isPending?: boolean;
}

export function EditWorkLogDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  isPending,
}: EditWorkLogDialogProps) {
  const t = useTranslations("HomePage");
  // Convert initialValues.date (string) to dayjs for WorkLogForm
  const [formValues, setFormValues] = useState<WorkLogFormValues>({
    date: initialValues.date ? dayjs(initialValues.date) : undefined,
    startTime: initialValues.startTime,
    endTime: initialValues.endTime,
    description: initialValues.description,
  });

  function handleFormChange(values: WorkLogFormValues) {
    setFormValues(values);
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({
      date: formValues.date ? formValues.date.format("YYYY-MM-DD") : "",
      startTime: formValues.startTime,
      endTime: formValues.endTime,
      description: formValues.description,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editWorkLogTitle")}</DialogTitle>
        </DialogHeader>
        <WorkLogForm
          values={formValues}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
          isPending={isPending}
          t={t}
        />
      </DialogContent>
    </Dialog>
  );
}
