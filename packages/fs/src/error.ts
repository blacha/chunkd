export class FsError extends Error {
  code: number;
  constructor(msg: string, code: number, cause?: unknown) {
    super(msg, { cause });
    this.code = code;
  }
}
