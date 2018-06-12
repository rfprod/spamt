import { Injectable } from '@angular/core';

import { CustomHttpWithAuthService } from '../services/custom-http-with-auth.service';
import { CustomHttpHandlersService } from '../services/custom-http-handlers.service';
import { CustomHttpUtilsService } from '../services/custom-http-utils.service';

import { Observable } from 'rxjs';
import { timeout, take, map, catchError } from 'rxjs/operators';

@Injectable()
export class ControlsUsersListService {

	constructor(
		private http: CustomHttpWithAuthService,
		private handlers: CustomHttpHandlersService,
		private utils: CustomHttpUtilsService
	) {}

	public appDataUrl: string = this.utils.apiUrl('/api/controls/list/users');

	public getData(): Observable<any[]> {
		return this.http.get(this.appDataUrl, false).pipe(
			timeout(this.utils.timeoutValue),
			map(this.handlers.extractArray),
			catchError(this.handlers.handleError)
		);
	}
}
