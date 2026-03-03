export interface BaseResponse<T> {
    success:    boolean;
    statusCode: number;
    message:    string;
    data:       T;
}

export interface DateRangeFilter {
    startDate: string | Date;
    endDate:   string | Date;
}