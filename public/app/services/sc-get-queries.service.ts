import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CustomHttpHandlersService } from '../services/custom-http-handlers.service';
import { CustomHttpUtilsService } from '../services/custom-http-utils.service';

import { Observable } from 'rxjs';
import { timeout, take, map, catchError } from 'rxjs/operators';

@Injectable()
export class SCgetQueriesService {

	constructor(
		private http: HttpClient,
		private handlers: CustomHttpHandlersService,
		private utils: CustomHttpUtilsService
	) {}

	public appDataUrl: string = this.utils.apiUrl('/api/sc/get/queries');

	public getData(): Observable<any[]> {
		return this.http.get(this.appDataUrl).pipe(
			timeout(this.utils.timeoutValue),
			map(this.handlers.extractArray),
			catchError(this.handlers.handleError)
		);
	}
}
