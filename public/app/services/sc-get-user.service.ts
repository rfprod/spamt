import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class SCgetUserService {
	public appDataUrl: string = window.location.origin + '/sc/get/user?name=';
	constructor (private http: Http) {}

	public extractData(res: Response) {
		let body = res.json();
		return body || {};
	}

	public handleError(error: any) {
		let errMsg = (error.message) ? error.message :
			error.status ? `$[error.status] - $[error.statusText]` : 'Server error';
		console.log(errMsg);
		return Observable.throw(errMsg);
	}

	public getUserDetails(userName): Observable<any[]> { // tslint:disable-line
		return this.http.get(this.appDataUrl + userName)
			.map(this.extractData)
			.catch(this.handleError);
	}
}
