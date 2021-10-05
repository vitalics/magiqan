export default class RetryError extends Error {
  constructor(retries: number) {
    super(`Retry count is reached after ${retries} attempt`);
  }
}