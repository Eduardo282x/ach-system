import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "../ui/table";

interface TableSkeletonProps {
    columns: number;
    rows?: number;
}

export const TableSkeleton = ({ columns, rows = 20 }: TableSkeletonProps) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <TableCell key={colIndex}>
                            <Skeleton className="h-4 w-full" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
};
