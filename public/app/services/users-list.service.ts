import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class UsersListService {
	public appDataUrl: string = window.location.origin + '/users';
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

	public getUsersList(): Observable<any[]> { // tslint:disable-line
		// had to disable all tslint rules for previous line, disabling no-unused-variable is buggy
		return this.http.get(this.appDataUrl)
			.map(this.extractData)
			.catch(this.handleError);
	}
}
