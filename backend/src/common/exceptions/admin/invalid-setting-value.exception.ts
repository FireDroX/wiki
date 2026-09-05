export class InvalidSettingValueException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSettingValueException';
  }
}
