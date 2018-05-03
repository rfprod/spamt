import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { CustomHttpHandlersService } from '../services/custom-http-handlers.service';
import { CustomHttpUtilsService } from '../services/custom-http-utils.service';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class SCgetUserService {

	constructor(
		private http: Http,
		private handlers: CustomHttpHandlersService,
		private utils: CustomHttpUtilsService
	) {}

	public appDataUrl: string = this.utils.apiUrl('/api/sc/get/user?name=');

	public getData(userName: string): Observable<any> {
		return this.http.get(this.appDataUrl + userName)
			.timeout(this.utils.timeoutValue)
			.map(this.handlers.extractObject)
			.catch(this.handlers.handleError);
	}
}
