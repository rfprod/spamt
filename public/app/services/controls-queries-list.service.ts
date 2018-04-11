import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ControlsQueriesListService {

	constructor(private http: Http) {}

	public appDataUrl: string = window.location.origin + '/api/controls/list/queries?user_token=';

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

	public getData(userToken: string, page: number = 1): Observable<any> {
		return this.http.get(this.appDataUrl + userToken + '&page=' + page)
			.map(this.extractData)
			.catch(this.handleError);
	}
}
