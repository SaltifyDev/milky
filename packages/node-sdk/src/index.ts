import EventEmitter from 'node:events';
import { createEventSource } from 'eventsource-client';
import type { ApiCollection, ApiResponse } from './api';
import type { EventCollection } from './event';

const combineUrl = (base: string, path: string) => {
  const baseUrl = base.endsWith('/') ? base.slice(0, -1) : base;
  const pathUrl = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/${pathUrl}`;
};

export class MilkyClient {
  private readonly eventEmitter: EventEmitter;
  private readonly httpApiUrl: string;
  private readonly eventUrl: string;
  private readonly fetchHeader: Record<string, string>;
  private disposeCore?: () => void;

  /**
   * @param address The address of the Milky API server
   * @param port The port of the Milky API server
   * @param base The base path for the Milky API
   * @param accessToken The access token for authentication (optional)
   * @param useHttps Whether to use HTTPS (default: false)
   * @deprecated Use the overload with `authority` instead. This will be removed in a future version.
   */
  constructor(address: string, port: number, base: string, accessToken?: string, useHttps?: boolean);
  /**
   * @param authority The authority of the Milky API (value of `new URL('https://example.com:443/some-path').host`)
   * @param basePath The base path for the Milky API
   * @param accessToken The access token for authentication (optional)
   * @param useTLS Whether to use HTTPS and WSS (default: false)
   * @param useSSE Whether to use Server-Sent Events for event streaming (default: false)
   */
  constructor(
    authority: string,
    basePath?: `/${string}/` | '/',
    accessToken?: string,
    useTLS?: boolean,
    useSSE?: boolean
  );

  constructor(arg1: string, arg2?: number | string, arg3?: string, arg4?: string | boolean, arg5?: boolean) {
    const { authority, basePath, accessToken, useTLS, useSSE } =
      typeof arg2 === 'number'
        ? {
            authority: `${arg1}:${arg2}`,
            basePath: arg3 ?? '/',
            accessToken: arg4,
            useTLS: arg5,
            useSSE: false,
          }
        : {
            authority: arg1,
            basePath: arg2 ?? '/',
            accessToken: arg3,
            useTLS: !!arg4,
            useSSE: !!arg5,
          };

    const httpProtocol = useTLS ? 'https' : 'http';
    const urlFragment = `${authority}${basePath}`;
    const httpUrlBase = `${httpProtocol}://${urlFragment}`;
    this.fetchHeader = {};
    if (accessToken) this.fetchHeader['Authorization'] = `Bearer ${accessToken}`;

    this.eventEmitter = new EventEmitter();
    this.httpApiUrl = combineUrl(httpUrlBase, 'api');
    this.eventUrl = combineUrl(httpUrlBase, 'api');
    if (!useSSE) {
      this.createWebsocket();
    } else {
      this.createSSE();
    }
  }

  /**
   * Call a Milky API method.
   * @param method The API method to call
   * @param input The input parameters for the API method.
   * If the API does not require any input, you can leave it empty.
   */
  async callApi<K extends keyof ApiCollection>(
    method: K,
    ...input: Parameters<ApiCollection[K]>
  ): Promise<ReturnType<ApiCollection[K]>> {
    const response = await fetch(combineUrl(this.httpApiUrl, method), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...this.fetchHeader,
      },
      body: JSON.stringify(input[0] ?? {}),
    });
    const callResult = (await response.json()) as ApiResponse;
    if (callResult.status === 'failed') {
      throw new Error(`call api ${method} failed with retcode ${callResult.retcode}: ${callResult.message}`);
    }
    return callResult.data as ReturnType<ApiCollection[K]>;
  }

  /**
   * Listen for a Milky event.
   * @param eventType The event type to listen for
   * @param listener The listener function to call when the event is emitted
   */
  async onEvent<K extends keyof EventCollection>(
    eventType: K,
    listener: (data: EventCollection[K]) => void
  ): Promise<void> {
    this.eventEmitter.on(eventType, listener);
  }

  private createSSE() {
    const sse = createEventSource({
      url: this.eventUrl,
      headers: {
        Accept: 'text/event-stream',
        ...this.fetchHeader,
      },
      onMessage: (event) => {
        if (event.event !== 'milky_event') return;

        const data = JSON.parse(event.data);
        this.eventEmitter.emit(data.event_type, data);
      },
    });

    sse.connect();

    this.disposeCore = sse.close;
  }

  private createWebsocket() {
    if (!globalThis.WebSocket) throw new Error('WebSocket is not supported in this environment.');

    const ws = new WebSocket(this.eventUrl, {
      headers: {
        ...this.fetchHeader,
      },
    });
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      this.eventEmitter.emit(data.event_type, data);
    });

    this.disposeCore = ws.close;
  }

  /**
   * Release the WebSocket / Server Sent Event connection.
   */
  dispose() {
    this.disposeCore?.();
  }

  [Symbol.dispose] = this.dispose;
}
