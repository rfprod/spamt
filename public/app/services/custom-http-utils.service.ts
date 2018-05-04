import { Injectable, Inject } from '@angular/core';

@Injectable()
export class CustomHttpUtilsService {

	constructor(
		@Inject('Window') private window: Window
	) {}

	/**
	 * Default timeout value for http requests.
	 */
	public timeoutValue: number = 10000;

	/**
	 * Returns api url.
	 * @param endpoint API endpoint
	 */
	public apiUrl(endpoint: string): string {
		return this.window.location.origin + endpoint;
	}

}
