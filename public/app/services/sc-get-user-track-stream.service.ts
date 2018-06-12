import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CustomHttpHandlersService } from '../services/custom-http-handlers.service';
import { CustomHttpUtilsService } from '../services/custom-http-utils.service';

import { Observable } from 'rxjs';
import { timeout, take, map, catchError } from 'rxjs/operators';

@Injectable()
export class SCgetUserTrackStreamService {

	constructor(
		private http: HttpClient,
		private handlers: CustomHttpHandlersService,
		private utils: CustomHttpUtilsService
	) {}

	public appDataUrl: string = this.utils.apiUrl('/api/sc/get/user/track/stream?endpoint_uri=');

	public getData(apiUri: string): Observable<any> {
		/*
		*	Returns { status: '', location: ''}
		*/
		return this.http.get(this.appDataUrl + apiUri).pipe(
			timeout(this.utils.timeoutValue),
			map(this.handlers.extractObject),
			catchError(this.handlers.handleError)
		);
	}
}
