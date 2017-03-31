import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class UserLogoutService {
	public appDataUrl: string = window.location.origin + '/auth/logout';
	constructor (private http: Http) {}

	public extractData(res: Response) {
		let body = res.json();
		return body || {};
	}

	public handleError(error: any) {
		let errBody = (error._body) ? JSON.parse(error._body).message : '';
		let errMsg = (error.message) ? error.message :
			(error.status && errBody) ? `${error.status} - ${error.statusText}: ${errBody}` :
			error.status ? `${error.status} - ${error.statusText}` : 'Server error';
		return Observable.throw(errMsg);
	}

	public getData(twitterToken: string, soundcloudToken: string): Observable<any> {
		const query = (twitterToken) ? '?twitter_token=' + twitterToken : (soundcloudToken) ? '?soundcloud_token=' + soundcloudToken : '';
		return this.http.get(this.appDataUrl + query)
			.map(this.extractData)
			.catch(this.handleError);
	}
}