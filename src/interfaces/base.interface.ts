export interface BaseResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
}

export interface DateRangeFilter {
    startDate: string | Date;
    endDate: string | Date;
}

export interface Pagination {
    page: number;
    size: number;
    startDate?: string | Date;
    endDate?: string | Date;
}