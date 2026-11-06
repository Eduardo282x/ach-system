import { useRef, useState } from "react";
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadTemplateProduct, uploadExcelProducts } from '@/services/inventory.service';
import { INVENTORY_HISTORY_QUERY_KEY, INVENTORY_QUERY_KEY, useUploadInventoryEntryExcelMutation } from "@/hooks/inventory.hook";
import { useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { Spinner } from "@/components/ui/spinner";
import { LuLayoutTemplate } from "react-icons/lu";
import { IoMdCloudUpload } from "react-icons/io";
import { FaFileExcel } from "react-icons/fa";
import { formatNumberWithDecimal } from "@/helpers/formatters";
import type { ImportSummary, InventoryEntryImportResult } from "@/interfaces/inventory.interface";

const ALLOWED_EXTENSION = '.xlsx';
const ALLOWED_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

type ImportMode = 'products' | 'entry';

const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const DownloadAndUploadProducts = () => {

    const queryClient = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<ImportMode>('products');
    const [file, setFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [summary, setSummary] = useState<ImportSummary | null>(null);
    const [entryResult, setEntryResult] = useState<InventoryEntryImportResult | null>(null);

    const uploadEntryMutation = useUploadInventoryEntryExcelMutation();

    const downloadTemplate = async () => {
        const blob = await downloadTemplateProduct();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Plantilla Productos.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    }

    const openImport = (nextMode: ImportMode) => {
        setMode(nextMode);
        setFile(null);
        setSummary(null);
        setEntryResult(null);
        setOpen(true);
    }

    const isValidExcel = (selectedFile: File) => {
        const isCorrectExtension = selectedFile.name.toLowerCase().endsWith(ALLOWED_EXTENSION);
        const isCorrectMime = selectedFile.type === ALLOWED_MIME;
        return isCorrectExtension || isCorrectMime;
    };

    const handleFile = (selectedFile?: File) => {
        if (!selectedFile) return;
        if (!isValidExcel(selectedFile)) {
            toast.error('Solo se permiten archivos con extensión .xlsx', {
                duration: 2500,
                position: 'top-right'
            });
            return;
        }
        setSummary(null);
        setEntryResult(null);
        setFile(selectedFile);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        handleFile(event.dataTransfer.files[0]);
    };

    const invalidateInventory = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] }),
            queryClient.invalidateQueries({ queryKey: [INVENTORY_HISTORY_QUERY_KEY] }),
            queryClient.invalidateQueries({ queryKey: ['inventory-entries'] }),
            queryClient.invalidateQueries({ queryKey: ['product-price-search'] }),
        ]);
    }

    const uploadFile = async () => {
        if (!file) return;

        setIsUploading(true);

        try {
            if (mode === 'entry') {
                const response = await uploadEntryMutation.mutateAsync(file);

                if (!response.success || response.data == null) {
                    toast.error(response.message || 'No se pudo cargar la entrada de inventario', {
                        duration: 3500,
                        position: 'top-right'
                    });
                    return;
                }

                setSummary(response.data.summary);
                setEntryResult(response.data);
                setFile(null);
                await invalidateInventory();
                toast.success(response.message || 'Entrada de inventario creada correctamente', {
                    duration: 3000,
                    position: 'top-right'
                });
                return;
            }

            const response = await uploadExcelProducts(file);

            if (!response.success || response.data == null) {
                toast.error(response.message || 'No se pudo cargar el archivo', {
                    duration: 3500,
                    position: 'top-right'
                });
                return;
            }

            setSummary(response.data);
            setFile(null);
            await invalidateInventory();
            toast.success(response.message || 'Productos procesados correctamente', {
                duration: 3000,
                position: 'top-right'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        if (isUploading) return;
        setOpen(false);
        setFile(null);
        setSummary(null);
        setEntryResult(null);
    };

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="export">
                        <LuLayoutTemplate />
                        Plantilla
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem
                        className='capitalize hover:bg-gray-200'
                        onClick={downloadTemplate}
                    >
                        Descargar Plantilla de excel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className='capitalize hover:bg-gray-200'
                        onClick={() => openImport('products')}
                    >
                        Cargar productos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className='capitalize hover:bg-gray-200'
                        onClick={() => openImport('entry')}
                    >
                        Cargar entrada de inventario
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === 'entry' ? 'Cargar Entrada de Inventario' : 'Cargar Productos'}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === 'entry'
                                ? 'Complete la hoja "Entrada" y la hoja "Productos" de la plantilla. Los productos existentes con código y nombre similar se actualizan y la cantidad se suma al stock.'
                                : 'Arrastra y suelta un archivo Excel (.xlsx) o haz clic para seleccionarlo. Si un producto coincide por código y nombre, se actualiza y se suma el stock.'}
                        </DialogDescription>
                    </DialogHeader>

                    <input
                        ref={inputRef}
                        type="file"
                        accept={ALLOWED_EXTENSION}
                        className="hidden"
                        onChange={(event) => {
                            handleFile(event.target.files?.[0]);
                            event.target.value = '';
                        }}
                    />

                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => inputRef.current?.click()}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                inputRef.current?.click();
                            }
                        }}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setIsDragOver(true);
                        }}
                        onDragEnter={(event) => {
                            event.preventDefault();
                            setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${isDragOver
                            ? "border-green-600 bg-green-50"
                            : "border-gray-300 bg-gray-50 hover:border-green-600 hover:bg-green-50"
                            }`}
                    >
                        {file ? (
                            <>
                                <FaFileExcel className="size-10 text-green-600" />
                                <p className="text-sm font-medium break-all">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setFile(null);
                                    }}
                                >
                                    Quitar archivo
                                </Button>
                            </>
                        ) : (
                            <>
                                <IoMdCloudUpload className="size-10 text-green-600" />
                                <p className="text-sm font-medium">
                                    Arrastra tu archivo aquí o <span className="text-green-600 underline">haz clic para seleccionar</span>
                                </p>
                                <p className="text-xs text-muted-foreground">Solo archivos .xlsx</p>
                            </>
                        )}
                    </div>

                    {summary && (
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm space-y-2 max-h-64 overflow-y-auto">
                            {entryResult && (
                                <p className="font-semibold text-green-700">
                                    Entrada N° {entryResult.entry.controlNumber} creada correctamente.
                                </p>
                            )}

                            <p className="font-semibold">
                                Creados: {summary.created} | Actualizados: {summary.updated} | Omitidos: {summary.skipped}
                            </p>

                            {summary.products.length > 0 && (
                                <div className="space-y-2">
                                    <p className="font-semibold text-gray-700">Detalle de productos procesados</p>
                                    {summary.products.map((product, index) => (
                                        <div key={`${product.barcode}-${index}`} className="rounded border border-gray-200 bg-white p-2">
                                            <p className="font-medium">
                                                {product.name} <span className="text-gray-500">({product.barcode})</span>
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {product.action === 'updated' ? 'Actualizado' : 'Creado'} · Cantidad sumada: {formatNumberWithDecimal(product.quantityAdded, 3)}
                                            </p>
                                            {product.previous && (
                                                <p className="text-xs text-gray-600">
                                                    Compra: {formatNumberWithDecimal(product.previous.purchasePrice)} → {formatNumberWithDecimal(product.current.purchasePrice)} ·
                                                    Venta: {formatNumberWithDecimal(product.previous.price)} → {formatNumberWithDecimal(product.current.price)} ·
                                                    Stock: {formatNumberWithDecimal(product.previous.stock, 3)} → {formatNumberWithDecimal(product.current.stock, 3)}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {summary.errors.length > 0 && (
                                <div className="space-y-1">
                                    <p className="font-semibold text-red-700">Filas con problemas</p>
                                    {summary.errors.map((error, index) => (
                                        <p key={index} className="text-xs text-red-700">
                                            Fila {error.row}: {error.reason}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
                            {summary ? 'Cerrar' : 'Cancelar'}
                        </Button>
                        <Button
                            variant="export"
                            onClick={uploadFile}
                            disabled={!file || isUploading}
                        >
                            {isUploading ? <Spinner /> : <IoMdCloudUpload />}
                            {isUploading ? 'Procesando...' : 'Subir'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
