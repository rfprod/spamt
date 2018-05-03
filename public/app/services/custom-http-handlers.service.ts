import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';

@Injectable()
export class CustomHttpHandlersService {

	/**
	 * Extracts response in format { a: {}, b: '' }.
	 * @param res http response
	 */
	public extractObject(res: Response): object {
		return (res) ? res.json() : {};
	}

	/**
	 * Extracts response in format [ {}, {}, {} ].
	 * @param res http response
	 */
	public extractArray(res: Response): any[] {
		return (res) ? res.json() : [];
	}

	/**
	 * Parses error response in the following format
	 * { _body: "{ message: 'actual error message' } ] }", status, statusText }
	 * @param error error object
	 */
	public handleError(error: any): Observable<any> {
		console.log('ERROR', JSON.stringify(error));
		const msg = (error._body) ? JSON.parse(error._body).message : '';
		const errMsg = (error.status && msg) ? `${error.status} - ${error.statusText}: ${msg}` :
			(error.status && error.statusText) ? `${error.status} - ${error.statusText}` :
			(error.status) ? `${error.status} - Server error` : 'Server error';
		return Observable.throw(errMsg);
	}

}
