import dayjs, { type Dayjs } from "dayjs";
import { AlertCircleIcon, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Alert, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export interface WorkLogFormValues {
  date?: Dayjs;
  startTime: string;
  endTime: string;
  description: string;
}

interface WorkLogFormProps {
  values: WorkLogFormValues;
  onChange: (values: WorkLogFormValues) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error?: string;
  isPending?: boolean;
  t: (key: string) => string;
}

export function WorkLogForm({
  values,
  onChange,
  onSubmit,
  error,
  isPending,
  t,
}: WorkLogFormProps) {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  return (
    <form onSubmit={onSubmit} className="mb-6 flex flex-col gap-2">
      <div className="flex w-full flex-col gap-3">
        <Label htmlFor="date" className="px-1">
          <CalendarIcon size={16} /> {t("dateLabel")}
        </Label>
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="w-full justify-between font-normal"
              type="button"
            >
              {values.date
                ? dayjs(values.date).format("D.M.YYYY")
                : "Select date"}
              <CalendarIcon size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={values.date ? values.date.toDate() : undefined}
              captionLayout="dropdown"
              onSelect={(date) => {
                onChange({ ...values, date: date ? dayjs(date) : undefined });
                setDatePopoverOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-row gap-2">
        <Input
          type="time"
          value={values.startTime}
          onChange={(e) => onChange({ ...values, startTime: e.target.value })}
        />
        <Input
          type="time"
          value={values.endTime}
          onChange={(e) => onChange({ ...values, endTime: e.target.value })}
        />
      </div>
      <Input
        type="text"
        placeholder={t("description")}
        value={values.description}
        onChange={(e) => onChange({ ...values, description: e.target.value })}
      />
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
