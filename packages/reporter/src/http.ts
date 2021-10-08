import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';

import { Reporter } from './base';

export abstract class HttpReporter extends Reporter {
  protected readonly http: AxiosInstance;
  constructor(options: AxiosRequestConfig) {
    super();
    this.http = axios.create(options);
  }
}
