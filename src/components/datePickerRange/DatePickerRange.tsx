
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
}

export function DatePickerRange({ display = 'block', onChange }: DatePickerRangeProps) {
    const today = new Date();
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    })

    const changeDate = (selectedDate: DateRange | undefined) => {
        setDate(selectedDate);
        onChange(selectedDate);
    }

    return (
        <Field className={`max-w-60 ${display === 'flex' ? 'flex flex-row items-center gap-2' : 'block'}`}>
            <div className="w-32 text-blue-800">
                <FieldLabel htmlFor="date-picker-range" className="w-32 font-semibold text-md">Rango de Fecha: </FieldLabel>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date-picker-range"
                        className="justify-start px-2.5 font-normal"
                    >
                        <CalendarIcon />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                                    {format(date.to, "LLL dd, y", { locale: es })}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y", { locale: es })
                            )
                        ) : (
                            <span>Selecciona una fecha</span>
                        )}
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