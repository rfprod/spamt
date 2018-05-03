import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { CustomHttpHandlersService } from '../services/custom-http-handlers.service';
import { CustomHttpUtilsService } from '../services/custom-http-utils.service';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class UserLogoutService {

	constructor(
		private http: Http,
		private handlers: CustomHttpHandlersService,
		private utils: CustomHttpUtilsService
	) {}

	public appDataUrl: string = this.utils.apiUrl('/api/auth/logout');

	public getData(twitterToken: string, soundcloudToken: string): Observable<any> {
		const query = (twitterToken) ? '?twitter_token=' + twitterToken : (soundcloudToken) ? '?soundcloud_token=' + soundcloudToken : '';
		return this.http.get(this.appDataUrl + query)
			.timeout(this.utils.timeoutValue)
			.map(this.handlers.extractObject)
			.catch(this.handlers.handleError);
	}
}
