import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

import { Observable, concat, throwError } from 'rxjs';

@Injectable()
export class CustomHttpHandlersService {

	/**
	 * Extracts response in format { a: {}, b: '' }.
	 */
	public extractObject(res: any): object {
		return (!res) ? {} : res;
	}

	/**
	 * Extracts response in format [ {}, {}, {} ].
	 */
	public extractArray(res: any): any[] {
		return (!res) ? [] : res;
	}

	/**
	 * Extracts HttpResponse.
	 */
	public extractHttpResponse(res: HttpResponse<any>): any {
		return res.body;
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
		return concat(throwError(errMsg));
	}

}
