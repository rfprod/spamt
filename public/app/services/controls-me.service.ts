import { Injectable } from '@angular/core';

import { CustomHttpWithAuthService } from '../services/custom-http-with-auth.service';
import { CustomHttpHandlersService } from '../services/custom-http-handlers.service';
import { CustomHttpUtilsService } from '../services/custom-http-utils.service';

import { Observable } from 'rxjs';
import { timeout, take, map, catchError } from 'rxjs/operators';

@Injectable()
export class ControlsMeService {

	constructor(
		private http: CustomHttpWithAuthService,
		private handlers: CustomHttpHandlersService,
		private utils: CustomHttpUtilsService
	) {}

	public appDataUrl: string = this.utils.apiUrl('/api/controls/me');

	public getData(): Observable<any> {
		return this.http.get(this.appDataUrl, false).pipe(
			timeout(this.utils.timeoutValue),
			map(this.handlers.extractObject),
			catchError(this.handlers.handleError)
		);
	}
}
