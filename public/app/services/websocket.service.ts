import { Injectable, Inject } from '@angular/core';

@Injectable()
export class WebsocketService {

	constructor(
		@Inject('Window') private window: Window
	) {}

	private host: string = this.window.location.host;
	private wsProtocol: string = (this.window.location.protocol === 'http:') ? 'ws://' : 'wss://';

	/**
	 * Generates websocket url.
	 */
	public generateUrl(endpoint: string): string {
		return (this.host.indexOf('localhost') !== -1) ? this.wsProtocol + this.host + endpoint : this.wsProtocol + this.host + endpoint;
	}
}
