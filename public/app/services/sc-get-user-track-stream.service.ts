import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class SCgetUserTrackStreamService {

	constructor(private http: Http) {}

	public appDataUrl: string = window.location.origin + '/api/sc/get/user/track/stream?endpoint_uri=';

	public extractData(res: Response) {
		console.log('extractData: ', res);
		const body = res.json();
		return body || {};
	}

	public handleError(error: any) {
		const errMsg = (error.message) ? error.message :
			error.status ? `${error.status} - ${error.statusText}` : 'Server error';
		console.log(errMsg);
		return Observable.throw(errMsg);
	}

	public getData(apiUri: string): Observable<any> {
		/*
		*	Returns { status: '', location: ''}
		*/
		return this.http.get(this.appDataUrl + apiUri)
			.map(this.extractData)
			.catch(this.handleError);
	}
}
