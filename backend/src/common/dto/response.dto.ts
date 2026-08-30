import { ApiStatus } from '../enums/api-status.enum.js';

export class ResponseDto<T> {
  status: ApiStatus;
  data: T | null;

  constructor(data: T | null) {
    this.status = ApiStatus.SUCCESS;
    this.data = data;
  }
}
