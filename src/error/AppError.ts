export class AppError extends Error {

  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }

  toString(): string {
    return JSON.stringify({
      code: this.code,
      error: this.message
    });
  }
}
