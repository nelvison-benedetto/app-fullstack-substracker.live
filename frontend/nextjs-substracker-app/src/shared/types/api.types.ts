export type ApiError = {
  statusCode: number;
  message: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: ApiError | null;
};

/*
every Ok response from backend ALWYAS look like
{
  "success": true,
  "data": [...],
  "error": null
}
every error response from backend ALWYAS look like
{
  "success": false,
  "data": null,
  "error": {
    "statusCode": 400,
    "message": "Something went wrong"
  }
}
*/