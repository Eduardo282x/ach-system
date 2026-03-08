import { useCallback, useMemo, useState, type JSX } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { FaFilter } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import type { Pagination } from "@/interfaces/base.interface";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Loading } from "../loader/Loading";

export interface ColumnDef<T> {
    key: keyof T;
    header: string;
    width?: string;
    element: (row: T) => string | JSX.Element;
    class?: (row: T) => string;
    icons?: (row: T) => {
        icon: React.ComponentType<{ className?: string }>;
        action: string;
        label: string;
        variant: 'primary' | 'error' | 'outline';
    }[]
    visible: boolean;
}

interface TableComponentProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    pagination?: Pagination
    totalElements?: number
    ignorePagination?: boolean;
    isLoading?: boolean;
    onChange: (action: string, data: T) => void;
}

export const TableComponent = <T,>({ columns, data, onChange, ignorePagination, pagination, totalElements, isLoading }: TableComponentProps<T>) => {
    const [size, setSize] = useState(pagination?.size || 100);

    const getRowKey = useCallback((row: T, rowIndex: number) => {
        if (typeof row === "object" && row !== null && "id" in row) {
            return String((row as { id?: string | number }).id ?? rowIndex);
        }

        return String(rowIndex);
    }, []);

    const styleVariant = (variant: 'primary' | 'error' | 'outline') => {
        switch (variant) {
            case 'primary':
                return 'text-blue-600';
            case 'error':
                return 'text-red-600';
            case 'outline':
                return 'text-gray-600';
            default:
                return '';
        }
    }

    const tableRows = useMemo(() => {
        return data.map((row, rowIndex) => (
            <TableRow key={getRowKey(row, rowIndex)} className="bg-muted">
                {columns.map((column) => (
                    <TableCell key={column.key.toString()}>
                        {column.icons ? (
                            <div className="flex items-center gap-4">
                                {column.icons(row).map((icon) => (
                                    <Tooltip key={icon.action}>
                                        <TooltipTrigger asChild>
                                            <Button size='icon' variant='ghost' onClick={() => onChange(icon.action, row)}>
                                                <icon.icon className={`${styleVariant(icon.variant)} text-lg`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{icon.label}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        ) : (
                            <p className={column.class ? column.class(row) : ''}>{column.element(row)}</p>
                        )}
                    </TableCell>
                ))}
            </TableRow>
        ));
    }, [data, columns, onChange, getRowKey]);

    return (
        <div>
            <div className="rounded-md border hidden lg:block shadow-md">
                <Table className="relative">
                    <TableHeader className={`shadow-md`}>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.key.toString()} style={{ width: column.width }}>{column.header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell className="h-full text-center py-32 bg-gray-200" colSpan={columns.length}>
                                    No hay datos disponibles
                                </TableCell>
                            </TableRow>
                        )}
                        {isLoading && (
                            <TableRow>
                                <TableCell className="h-full text-center py-32 bg-gray-200" colSpan={columns.length}>
                                    <Loading />
                                    <p className="text-sm text-gray-700">Cargando...</p>
                                </TableCell>
                            </TableRow>
                        )}
                        {tableRows}
                    </TableBody>
                </Table>
            </div>
            {!ignorePagination && data.length > 0 && (
                <div className="flex items-center justify-between">

                    <p className="text-sm text-gray-700 mt-3 ml-1">{
                        pagination && totalElements ?
                            `Mostrando ${pagination.page * pagination.size - pagination.size + 1} - ${Math.min(pagination.page * pagination.size, totalElements)} de ${totalElements} elementos` :
                            `Total de elementos ${data.length}`}
                    </p>

                    <div>
                        {pagination && totalElements && (
                            <div className="flex items-center gap-2 mt-4">
                                <Label htmlFor="select-rows-per-page">Elementos por página</Label>
                                <Select defaultValue={size.toString()} onValueChange={(value) => setSize(parseInt(value))}>
                                    <SelectTrigger className="w-20" id="select-rows-per-page">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent align="start">
                                        <SelectGroup>
                                            <SelectItem value="100">100</SelectItem>
                                            <SelectItem value="250">250</SelectItem>
                                            <SelectItem value="500">500</SelectItem>
                                            <SelectItem value="1000">1000</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}


export const SelectColumnsComponent = <T,>({ columns, onChange }: { columns: ColumnDef<T>[]; onChange: (columns: ColumnDef<T>[]) => void }) => {

    const changeChecked = (column: ColumnDef<T>, checked: boolean) => {
        const newColumns = columns.map(item => {
            return {
                ...item,
                visible: column.key === item.key ? checked : item.visible
            }
        })
        onChange(newColumns)
    }

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="bg-white text-blue-800 border border-blue-800 hover:bg-blue-700 hover:text-white"
                    >
                        <FaFilter />
                        Columnas
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {columns.map((column: ColumnDef<T>, index: number) => (
                        <DropdownMenuCheckboxItem
                            key={index}
                            className='capitalize hover:bg-gray-200'
                            checked={column.visible}
                            onCheckedChange={(checked) => changeChecked(column, checked)}
                            onSelect={(e) => e.preventDefault()}
                        >
                            {column.header}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}