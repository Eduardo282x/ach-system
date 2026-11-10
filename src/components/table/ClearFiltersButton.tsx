import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ClearFiltersButtonProps {
    onClear: () => void;
    label?: string;
}

export const ClearFiltersButton = ({ onClear, label = "Limpiar filtros" }: ClearFiltersButtonProps) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={onClear}
                    aria-label={label}
                    className="text-red-600 hover:text-red-700"
                >
                    <Trash2 className="size-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
};
