import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { CustomHttpHandlersService } from '../services/custom-http-handlers.service';
import { CustomHttpUtilsService } from '../services/custom-http-utils.service';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class SCgetUserTrackStreamService {

	constructor(
		private http: Http,
		private handlers: CustomHttpHandlersService,
		private utils: CustomHttpUtilsService
	) {}

	public appDataUrl: string = this.utils.apiUrl('/api/sc/get/user/track/stream?endpoint_uri=');

	public getData(apiUri: string): Observable<any> {
		/*
		*	Returns { status: '', location: ''}
		*/
		return this.http.get(this.appDataUrl + apiUri)
			.timeout(this.utils.timeoutValue)
			.map(this.handlers.extractObject)
			.catch(this.handlers.handleError);
	}
}
