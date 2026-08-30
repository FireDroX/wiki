export type ApiStatus = 'success' | 'error'

export interface ResponseDto<T> {
  status: ApiStatus
  data: T
}
