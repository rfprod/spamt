import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class ServerStaticDataService {
	public appDataUrl: string = window.location.origin + '/app-diag/static';
	constructor( private http: Http ) {
		console.log('window.location:', window.location);
		console.log('window.location.origin:', window.location.origin);
	}

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

	public getData(): Observable<any[]> { // tslint:disable-line
		return this.http.get(this.appDataUrl)
			.map(this.extractData)
			.catch(this.handleError);
	}
}
