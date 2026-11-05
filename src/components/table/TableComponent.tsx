import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
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
import { TableSkeleton } from "./TableSkeleton";
import { IoIosArrowDown } from "react-icons/io";
import { ChevronLeft, ChevronRight } from "lucide-react";

type VariantType = 'primary' | 'error' | 'outline' | 'secondary';
export interface ColumnDef<T> {
    key: string;
    header: string;
    width?: string;
    element: (row: T) => string | JSX.Element;
    class?: (row: T) => string;
    icons?: (row: T) => {
        icon: React.ComponentType<{ className?: string }>;
        action: string;
        label: string;
        variant: VariantType;
    }[]
    visible: boolean;
}

interface TableComponentProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    pagination?: Pagination
    totalElements?: number
    ignorePagination?: boolean;
    isExpansible?: boolean;
    automaticHeight?: boolean;
    isLoading?: boolean;
    onChange: (action: string, data: T) => void;
    onPaginationChange?: (page: number, size: number) => void;
    renderRow?: (item: T, index: number) => React.ReactNode;
}

const styleVariant = (variant: VariantType) => {
    switch (variant) {
        case 'primary':
            return 'text-blue-600';
        case 'error':
            return 'text-red-600';
        case 'outline':
            return 'text-gray-600';
        case 'secondary':
            return 'text-green-600';
        default:
            return '';
    }
}

const getPageWindow = (current: number, totalPages: number, maxVisible: number) => {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const getMaxVisiblePages = () => {
    if (typeof window === "undefined") return 18;
    if (window.innerWidth < 640) return 5;
    if (window.innerWidth < 768) return 7;
    if (window.innerWidth < 1024) return 10;
    if (window.innerWidth < 1280) return 13;
    return 18;
}

export const TableComponent = <T,>({
    columns,
    data,
    onChange,
    ignorePagination,
    pagination,
    totalElements,
    isLoading,
    isExpansible,
    renderRow,
    automaticHeight,
    onPaginationChange
}: TableComponentProps<T>) => {
    const [internalSize, setInternalSize] = useState(pagination?.size || 100);
    const [internalPage, setInternalPage] = useState(pagination?.page || 1);
    const [maxVisiblePages, setMaxVisiblePages] = useState(getMaxVisiblePages);

    const isControlled = Boolean(onPaginationChange && pagination);
    const size = isControlled ? (pagination?.size ?? internalSize) : internalSize;
    const page = isControlled ? (pagination?.page ?? internalPage) : internalPage;

    const getRowKey = useCallback((row: T, rowIndex: number) => {
        if (typeof row === "object" && row !== null && "id" in row) {
            return String((row as { id?: string | number }).id ?? rowIndex);
        }

        return String(rowIndex);
    }, []);

    useEffect(() => {
        const handleResize = () => setMaxVisiblePages(getMaxVisiblePages());

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil((totalElements ?? 0) / size)),
        [totalElements, size]
    );

    const visiblePages = useMemo(
        () => getPageWindow(page, totalPages, maxVisiblePages),
        [page, totalPages, maxVisiblePages]
    );

    const handlePageChange = (nextPage: number) => {
        const clampedPage = Math.min(Math.max(nextPage, 1), totalPages);

        if (clampedPage === page) return;

        if (isControlled) {
            onPaginationChange?.(clampedPage, size);
        } else {
            setInternalPage(clampedPage);
        }
    }

    const handleSizeChange = (nextSize: number) => {
        if (isControlled) {
            onPaginationChange?.(1, nextSize);
        } else {
            setInternalSize(nextSize);
            setInternalPage(1);
        }
    }

    const tableRows = useMemo(() => {
        return data.map((row, rowIndex) => (
            <TableRow key={getRowKey(row, rowIndex)} className="bg-muted">
                {columns.map((column, idx) => (
                    <TableCell key={idx}>
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
                            <div className={column.class ? column.class(row) : ''}>{column.element(row)}</div>
                        )}
                    </TableCell>
                ))}
            </TableRow>
        ));
    }, [data, columns, onChange, getRowKey]);

    return (
        <div>
            <div className="rounded-md border hidden lg:block shadow-md">
                <Table noMaxHeight={!automaticHeight} className="relative">
                    <TableHeader className={`shadow-md`}>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.key.toString()} style={{ width: column.width }}>{column.header}</TableHead>
                            ))}
                            {isExpansible && (
                                <TableHead className="cursor-pointer bg-white z-50">
                                    Abrir
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell className="h-full text-center py-32 bg-gray-200" colSpan={isExpansible ? columns.length + 1 : columns.length}>
                                    No hay datos disponibles
                                </TableCell>
                            </TableRow>
                        )}
                        {isLoading && (
                            <TableSkeleton columns={columns.length} rows={20} />
                        )}
                        {isExpansible ? data.map((item, key) => (
                            <ExpansibleRow
                                key={key}
                                index={key}
                                columns={columns}
                                data={item}
                                onChange={onChange}
                                renderRow={renderRow}
                            />
                        )) : tableRows}
                    </TableBody>
                </Table>
            </div>
            {!ignorePagination && (pagination && totalElements ? totalElements > 0 : data.length > 10) && (
                <div className="flex flex-wrap items-center justify-between gap-4">

                    <p className="text-sm text-gray-700 mt-3 ml-1">{
                        pagination && totalElements ?
                            `Mostrando ${page * size - size + 1} - ${Math.min(page * size, totalElements)} de ${totalElements} elementos` :
                            `Total de elementos ${data.length}`}
                    </p>

                    <div>
                        {pagination && totalElements && (
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex flex-wrap items-center gap-1">
                                        <Button
                                            type="button"
                                            className="h-9 w-9 p-0"
                                            onClick={() => handlePageChange(page - 1)}
                                            variant="outline"
                                            disabled={page === 1}
                                        >
                                            <ChevronLeft />
                                        </Button>
                                        {visiblePages.map((pageNumber) => (
                                            <Button
                                                key={pageNumber}
                                                type="button"
                                                className="h-9 min-w-9 p-0"
                                                variant={page === pageNumber ? "primary" : "outline"}
                                                aria-current={page === pageNumber ? "page" : undefined}
                                                onClick={() => handlePageChange(pageNumber)}
                                            >
                                                {pageNumber}
                                            </Button>
                                        ))}
                                        <Button
                                            type="button"
                                            className="h-9 w-9 p-0"
                                            onClick={() => handlePageChange(page + 1)}
                                            variant="outline"
                                            disabled={page >= totalPages}
                                        >
                                            <ChevronRight />
                                        </Button>
                                    </div>

                                    <Label htmlFor="select-rows-per-page">Elementos por página</Label>
                                    <Select value={size.toString()} onValueChange={(value) => handleSizeChange(parseInt(value))}>
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
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

interface TableRowNormalProps<T> {
    index: number;
    columns: ColumnDef<T>[];
    data: T;
    colSpanColumns?: boolean;
    onChange: (action: string, data: T) => void;
    renderRow?: (item: T, index: number) => React.ReactNode;
}

const ExpansibleRow = <T,>({ index, columns, data, onChange, renderRow }: TableRowNormalProps<T>) => {
    const [open, setOpen] = useState<boolean>(false);
    const rowRef = useRef<HTMLTableRowElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (rowRef.current && !rowRef.current.contains(event.target as Node)) {
                // setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <TableRow
                key={`main-${index}`}
                ref={rowRef}
                onClick={() => setOpen(!open)}
                className="cursor-pointer transition-all"
            >
                {columns.map((column: ColumnDef<T>, idx: number) => (
                    <TableCell key={idx}>
                        {column.icons ? (
                            <div className="flex items-center gap-4">
                                {column.icons(data).map((icon) => (
                                    <Tooltip key={icon.action}>
                                        <TooltipTrigger asChild>
                                            <Button size='icon' variant='ghost' onClick={() => onChange(icon.action, data)}>
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
                            <div className={column.class ? column.class(data) : ''}>{column.element(data)}</div>
                        )}
                    </TableCell>
                ))}
                <TableCell>
                    <IoIosArrowDown
                        className={`transition-transform text-xl ${open ? 'rotate-180' : 'rotate-0'}`}
                    />
                </TableCell>
            </TableRow>

            {/* Fila expandida */}
            <TableRow key={`expand-${index}`} className="bg-muted">
                <TableCell colSpan={columns.length + 1} className="p-0">
                    <div
                        className={`transition-all duration-300 ease-in-out w-full ${open ? 'h-auto px-4 py-2' : '!h-0'} interpolate overflow-hidden`}
                    >
                        <div>{renderRow && renderRow(data, index)}</div>
                    </div>
                </TableCell>
            </TableRow>
        </>
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