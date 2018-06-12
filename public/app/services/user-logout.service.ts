import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CustomHttpHandlersService } from '../services/custom-http-handlers.service';
import { CustomHttpUtilsService } from '../services/custom-http-utils.service';

import { Observable } from 'rxjs';
import { timeout, take, map, catchError } from 'rxjs/operators';

@Injectable()
export class UserLogoutService {

	constructor(
		private http: HttpClient,
		private handlers: CustomHttpHandlersService,
		private utils: CustomHttpUtilsService
	) {}

	public appDataUrl: string = this.utils.apiUrl('/api/auth/logout');

	public getData(twitterToken: string, soundcloudToken: string): Observable<any> {
		const query = (twitterToken) ? '?twitter_token=' + twitterToken : (soundcloudToken) ? '?soundcloud_token=' + soundcloudToken : '';
		return this.http.get(this.appDataUrl + query).pipe(
			timeout(this.utils.timeoutValue),
			map(this.handlers.extractObject),
			catchError(this.handlers.handleError)
		);
	}
}
