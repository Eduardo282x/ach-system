export interface BaseResponse<T> {
    success:    boolean;
    statusCode: number;
    message:    string;
    data:       T;
}