import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class SCgetUserService {

	constructor(private http: Http) {}

	public appDataUrl: string = window.location.origin + '/api/sc/get/user?name=';

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

	public getData(userName: string): Observable<any> {
		return this.http.get(this.appDataUrl + userName)
			.map(this.extractData)
			.catch(this.handleError);
	}
}
