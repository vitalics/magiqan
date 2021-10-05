export default class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Timeout was reached after ${ms} ms`);
  }
}
