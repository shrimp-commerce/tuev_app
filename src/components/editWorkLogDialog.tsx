import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

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
  const [date, setDate] = useState(initialValues.date);
  const [startTime, setStartTime] = useState(initialValues.startTime);
  const [endTime, setEndTime] = useState(initialValues.endTime);
  const [description, setDescription] = useState(initialValues.description);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ date, startTime, endTime, description });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editWorkLogTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDate(e.target.value)
            }
            disabled={isPending}
          />
          <Input
            type="time"
            value={startTime}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setStartTime(e.target.value)
            }
            disabled={isPending}
          />
          <Input
            type="time"
            value={endTime}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEndTime(e.target.value)
            }
            disabled={isPending}
          />
          <Input
            type="text"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDescription(e.target.value)
            }
            disabled={isPending}
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
