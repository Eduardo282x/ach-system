
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import { format } from "date-fns"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"
import { useState } from "react"
import { type DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { es } from "date-fns/locale";
import { Label } from "../ui/label"

interface DatePickerRangeProps {
    display?: 'flex' | 'block';
    onChange: (date: DateRange | undefined) => void;
    /** Permite usar el componente de forma controlada desde el padre. */
    value?: DateRange | undefined;
}

export function DatePickerRange({ display = 'block', onChange, value }: DatePickerRangeProps) {
    const today = new Date();
    const [internalDate, setInternalDate] = useState<DateRange | undefined>({
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    })

    const isControlled = value !== undefined;
    const date = isControlled ? value : internalDate;

    const changeDate = (selectedDate: DateRange | undefined) => {
        if (!isControlled) {
            setInternalDate(selectedDate);
        }
        onChange(selectedDate);
    }

    const dateLabel = date?.from
        ? date.to
            ? `${format(date.from, "dd/MM/yyyy", { locale: es })} - ${format(date.to, "dd/MM/yyyy", { locale: es })}`
            : format(date.from, "dd/MM/yyyy", { locale: es })
        : "Selecciona una fecha";

    return (
        <Field className={`min-w-0 max-w-full ${display === 'flex' ? 'w-auto flex flex-row flex-wrap items-center gap-2' : 'flex w-full flex-col gap-1 sm:max-w-90'}`}>
            <div className="w-32 shrink-0 text-blue-800">
                <FieldLabel htmlFor="date-picker-range" className="w-32 font-semibold text-md">Rango de Fecha: </FieldLabel>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date-picker-range"
                        title={dateLabel}
                        className="min-w-0 max-w-full shrink justify-start overflow-hidden px-2.5 font-normal"
                    >
                        <CalendarIcon className="shrink-0" />
                        <span className="min-w-0 truncate">{dateLabel}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={changeDate}
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
        </Field>
    )
}

interface DatePickerProps {
    onChange: (date: Date | undefined) => void;
}

export function DatePicker({ onChange }: DatePickerProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const changeDate = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        onChange(selectedDate);
    }

    const onChangeToday = () => {
        const today = new Date();
        setDate(today);
        onChange(today);
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="flex flex-col gap-2">
                    <Label>Selecciona una fecha</Label>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            data-empty={!date}
                            className="w-80 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                        >
                            {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                            <ChevronDownIcon />
                        </Button>
                        <Button variant='primary' onClick={onChangeToday}>Hoy</Button>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={changeDate}
                    defaultMonth={date}
                />
            </PopoverContent>
        </Popover>
    )
}