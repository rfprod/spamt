import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { CustomHttpWithAuthService } from '../services/custom-http-with-auth.service';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ControlsMeService {

	constructor(
		private http: CustomHttpWithAuthService
	) {}

	public appDataUrl: string = window.location.origin + '/api/controls/me';

	public extractData(res: Response) {
		const body = res.json();
		return body || {};
	}

	public handleError(error: any) {
		const errBody = (error._body) ? JSON.parse(error._body).message : '';
		const errMsg = (error.message) ? error.message :
			(error.status && errBody) ? `${error.status} - ${error.statusText}: ${errBody}` :
			error.status ? `${error.status} - ${error.statusText}` : 'Server error';
		return Observable.throw(errMsg);
	}

	public getData(isBlob: boolean = false): Observable<any> {
		return this.http.get(this.appDataUrl, isBlob)
			.map(this.extractData)
			.catch(this.handleError);
	}
}
