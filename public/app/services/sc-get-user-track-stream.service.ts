import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class SCgetUserTrackStreamService {
	public appDataUrl: string = window.location.origin + '/sc/get/user/track/stream?endpoint_uri=';
	constructor (private http: Http) {}

	public extractData(res: Response) {
		console.log('extractData: ', res);
		let body = res.json();
		return body || {};
	}

	public handleError(error: any) {
		let errMsg = (error.message) ? error.message :
			error.status ? `$[error.status] - $[error.statusText]` : 'Server error';
		console.log(errMsg);
		return Observable.throw(errMsg);
	}

	public getData(apiUri: string): Observable<any> { // tslint:disable-line
		/*
		*	Returns { status: '', location: ''}
		*/
		return this.http.get(this.appDataUrl + apiUri)
			.map(this.extractData)
			.catch(this.handleError);
	}
}
