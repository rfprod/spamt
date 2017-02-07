import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class SCgetUserDetailsService {
	public appDataUrl: string = window.location.origin + '/sc/get/user/details?endpoint_uri=';
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

	public getData(endpointUri: string): Observable<any[]> { // tslint:disable-line
		return this.http.get(this.appDataUrl + endpointUri)
			.map(this.extractData)
			.catch(this.handleError);
	}
}