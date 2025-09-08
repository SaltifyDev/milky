export * from './api.g';

export type ApiResponse =
  | {
      status: 'ok';
      retcode: 0;
      data: unknown;
    }
  | {
      status: 'failed';
      retcode: number;
      message: string;
    };
