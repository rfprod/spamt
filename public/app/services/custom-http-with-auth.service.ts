import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { CustomDeferredService } from './custom-deferred.service';
import { CustomHttpHandlersService } from './custom-http-handlers.service';

import { UserService } from './user.service';

import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

/*
*	Adds authorization headers to requests.
*	Subscribes to responses and checks token updates from the server.
*/
@Injectable()
export class CustomHttpWithAuthService {

	constructor(
		private http: HttpClient,
		private handlers: CustomHttpHandlersService,
		private userService: UserService
	) {
		this.restoredModel = this.userService.getUser();
	}

	/**
	 * Restored UserService model.
	 */
	private restoredModel: any;

	/**
	 * Adds authentication header.
	 * @param headers request headers
	 */
	private addAuthHeader(headers: HttpHeaders): HttpHeaders {
		this.restoredModel = (!this.restoredModel.user_token) ? this.userService.getUser() : this.restoredModel;
		return headers.append('Authorization', 'Bearer ' + this.restoredModel.user_token);
	}

	/**
	 * On successful response updates refreshed token if response contains x-auth-roken header containing it.
	 * @param res HttpClient response
	 */
	private checkTokenUpdate(res: any): void {
		console.log('token interceptor response headers check for X-AUTH-TOKEN');
		const tk = res.headers.get('x-auth-token');
		if (tk) {
			console.log('update token');
			this.userService.saveUser({ user_token: tk });
		}
	}

	/**
	 * Sends a get request with added auth header.
	 * @param url request url
	 * @param [isBlob] is response a blob
	 */
	public get(url: string, isBlob?: boolean): Observable<HttpResponse<any>> {
		let httpHeaders = new HttpHeaders();
		httpHeaders = this.addAuthHeader(httpHeaders);
		const options: object = { headers: httpHeaders, observe: 'response', responseType: (!isBlob) ? 'json' : 'blob' };
		return this.http.get(url, options).pipe(
			tap(
				(res: any) => this.checkTokenUpdate(res),
				(error: any) => console.log('User token update is not checked on error')
			),
			map(this.handlers.extractHttpResponse)
		);
	}

	/**
	 * Sends a post request with added auth header.
	 * @param url request url
	 * @param data form data
	 */
	public post(url: string, data: any): Observable<HttpResponse<any>> {
		let httpHeaders = new HttpHeaders();
		httpHeaders = this.addAuthHeader(httpHeaders);
		return this.http.post(url, data, { headers: httpHeaders, observe: 'response', responseType: 'json' }).pipe(
			tap(
				(res: any) => this.checkTokenUpdate(res),
				(error: any) => console.log('User token update is not checked on error')
			),
			map(this.handlers.extractHttpResponse)
		);
	}
}
