import type { JSX } from "react";
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

export interface ColumnDef<T> {
    key: keyof T;
    header: string;
    width?: string;
    element: (row: T) => string | JSX.Element;
    icons?: {
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
    onChange: (action: string, data: T) => void;
}

export const TableComponent = <T,>({ columns, data, onChange }: TableComponentProps<T>) => {

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
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell className="h-24 text-center" colSpan={columns.length}>
                                    No hay datos disponibles
                                </TableCell>
                            </TableRow>
                        )}
                        {data.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="bg-muted">
                                {columns.map((column) => (
                                    <TableCell key={column.key.toString()}>
                                        {column.icons ? (
                                            <div className="flex items-center gap-4">
                                                {column.icons.map((icon) => (
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
                                            column.element(row)
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div>
                <p className="text-sm text-gray-700 mt-3 ml-1">Total de elementos {data.length}</p>
            </div>
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