import { useRef, useState } from "react";
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadTemplateProduct, uploadExcelProducts } from '@/services/inventory.service';
import { INVENTORY_QUERY_KEY } from "@/hooks/inventory.hook";
import { useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { Spinner } from "@/components/ui/spinner";
import { LuLayoutTemplate } from "react-icons/lu";
import { IoMdCloudUpload } from "react-icons/io";
import { FaFileExcel } from "react-icons/fa";

const ALLOWED_EXTENSION = '.xlsx';
const ALLOWED_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const DownloadAndUploadProducts = () => {

    const queryClient = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

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
        setFile(selectedFile);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        handleFile(event.dataTransfer.files[0]);
    };

    const uploadFile = async () => {
        if (!file) return;
        setIsUploading(true);
        const response = await uploadExcelProducts(file);
        setIsUploading(false);
        if (response.success) {
            toast.success(response.message || 'Productos cargados correctamente', {
                duration: 3000,
                position: 'top-right'
            });
            setFile(null);
            setOpen(false);
            await queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
            return;
        }
        toast.error(response.message || 'No se pudo cargar el archivo', {
            duration: 3000,
            position: 'top-right'
        });
    };

    const handleClose = () => {
        if (isUploading) return;
        setOpen(false);
        setFile(null);
    };

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="bg-white text-green-800 border border-green-800 hover:bg-green-700 hover:text-white"
                    >
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
                        onClick={() => setOpen(true)}
                    >
                        Cargar productos
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cargar Productos</DialogTitle>
                        <DialogDescription>
                            Arrastra y suelta un archivo Excel (.xlsx) o haz clic para seleccionarlo.
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

                    <DialogFooter>
                        <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
                            Cancelar
                        </Button>
                        <Button
                            variant="export"
                            onClick={uploadFile}
                            disabled={!file || isUploading}
                        >
                            {isUploading ? <Spinner /> : <IoMdCloudUpload />}
                            {isUploading ? 'Subiendo...' : 'Subir'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}