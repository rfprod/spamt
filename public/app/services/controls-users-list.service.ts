import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { CustomHttpWithAuthService } from '../services/custom-http-with-auth.service';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ControlsUsersListService {

	constructor(
		private http: CustomHttpWithAuthService
	) {}

	public appDataUrl: string = window.location.origin + '/api/controls/list/users';

	public extractData(res: Response) {
		const body = res.json();
		return body || {};
	}

	public handleError(error: any) {
		const errMsg = (error.message) ? error.message :
			error.status ? `${error.status} - ${error.statusText}` : 'Server error';
		console.log(errMsg);
		return Observable.throw(errMsg);
	}

	public getData(): Observable<any> {
		const isBlob = false;
		return this.http.get(this.appDataUrl, isBlob)
			.map(this.extractData)
			.catch(this.handleError);
	}
}
