import type { JSX } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../button";
import { FaFilter } from "react-icons/fa";

export interface ColumnDef<T> {
    key: keyof T;
    header: string;
    width?: string;
    element: (row: T) => string | JSX.Element;
    icons?: {
        icon: React.ComponentType<{ className?: string }>;
        action: string;
        variant: 'primary' | 'error' | 'outline';
    }[]
    visible: boolean;
}

interface TableComponentProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
}

export const TableComponent = <T,>({ columns, data }: TableComponentProps<T>) => {

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
                                                    <Button size='icon' variant='ghost' key={icon.action}>
                                                        <icon.icon key={icon.action} className={`${styleVariant(icon.variant)} text-lg`} />
                                                    </Button>
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