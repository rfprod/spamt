import { Injectable } from '@angular/core';

import { CustomHttpWithAuthService } from '../services/custom-http-with-auth.service';
import { CustomHttpHandlersService } from '../services/custom-http-handlers.service';
import { CustomHttpUtilsService } from '../services/custom-http-utils.service';

import { Observable } from 'rxjs';
import { timeout, take, map, catchError } from 'rxjs/operators';

@Injectable()
export class ControlsQueriesListService {

	constructor(
		private http: CustomHttpWithAuthService,
		private handlers: CustomHttpHandlersService,
		private utils: CustomHttpUtilsService
	) {}

	public appDataUrl: string = this.utils.apiUrl('/api/controls/list/queries');

	public getData(page: number = 1): Observable<any[]> {
		if (page <= 0) {
			page = 1;
		}
		return this.http.get(this.appDataUrl + '?page=' + page, false).pipe(
			timeout(this.utils.timeoutValue),
			map(this.handlers.extractArray),
			catchError(this.handlers.handleError)
		);
	}
}
