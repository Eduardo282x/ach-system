export interface BaseResponse<T> {
    success:    boolean;
    statusCode: number;
    message:    string;
    data:       T;
}

export interface ApiError {
    message: string;
    statusCode: number;
    details?: unknown;
}

export type ApiResult<T> = {
    data: T | null;
    error: ApiError | null;
};