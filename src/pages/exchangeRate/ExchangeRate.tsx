import { TableComponent } from "@/components/table/TableComponent"
import { exchangeRateColumns } from "./exchangeRate.data"
import { useInventoryStore } from "@/store/inventory.store";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExchangeRateBody } from "@/interfaces/inventory.interface";
import { useExchangeRateMutation } from "@/hooks/inventory.hook";

export const ExchangeRate = () => {
    const exchangeRateMutation = useExchangeRateMutation();
    const exchangeRates = useInventoryStore((state) => state.exchangeRates);
    const { register, handleSubmit, control } = useForm<ExchangeRateBody>({
        defaultValues: {
            name: 'BCV',
            currency: 'USD',
            rate: 0,
        }
    });

    const onSubmit = (data: ExchangeRateBody) => {
        exchangeRateMutation.mutate(data);
    }


    return (
        <div className="w-1/2 mx-auto p-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-2xl font-semibold mb-2 ml-2">Tasas</p>
            </div>

            <div className="rounded-xl bg-white p-4">
                <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
                    <div className="w-full flex items-center justify-between gap-4 mb-4">
                        <Controller
                            name="currency"
                            control={control}
                            render={({ field }) => (
                                <Field className="col-span-1">
                                    <FieldLabel>Moneda</FieldLabel>
                                    <Select
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione una moneda" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value={'USD'}>Dólar</SelectItem>
                                                <SelectItem value={'EUR'}>Euro</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        />

                        <Field className="col-span-1">
                            <FieldLabel>Precio</FieldLabel>
                            <Input type="number" step="0.01" {...register('rate', { valueAsNumber: true })} />
                        </Field>

                    </div>
                    <div className="text-center w-full">
                        <Button variant="primary" className="w-1/2" type="submit">Actualizar Tasa</Button>
                    </div>
                </form>

                <TableComponent
                    onChange={() => { }}
                    ignorePagination={true}
                    columns={exchangeRateColumns}
                    data={exchangeRates ? exchangeRates : []}
                />
            </div>
        </div>
    )
}
