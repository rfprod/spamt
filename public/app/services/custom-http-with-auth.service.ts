import { Injectable} from '@angular/core';
import { Http, Response, Headers, ResponseContentType } from '@angular/http';

import { CustomDeferredService } from './custom-deferred.service';

import { UserService } from './user.service';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/first';

/*
*	Adds authorization headers to requests.
*	Subscribes to responses and checks token updates from the server.
*/
@Injectable()
export class CustomHttpWithAuthService {

	constructor(
		private http: Http,
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
	private addAuthHeader(headers: Headers): void {
		this.restoredModel = this.userService.getUser();
		headers.append('Authorization', 'Bearer ' + this.restoredModel.user_token);
	}

	/**
	 * Subscribes to observable and passes it through.
	 * On successful response updates refreshed token if response contains x-auth-roken header containing it.
	 * @param observable intercepted observable
	 */
	private checkTokenUpdate(observable: Observable<Response>): Observable<Response> {
		const def = new CustomDeferredService<any>();
		observable.first().subscribe(
			(res: Response) => {
				console.log('token interceptor response headers check');
				const tk = res.headers.get('x-auth-token');
				if (tk) {
					console.log('update token');
					this.userService.saveUser({ user_token: tk });
				}
				def.resolve(res);
			},
			(error: any) => {
				console.log('token interceptor does nothing on error');
				def.reject(error);
			},
			() => {
				console.log('token interceptor done');
			}
		);
		return Observable.fromPromise(def.promise);
	}

	/**
	 * Sends a get request with added auth header.
	 * @param url request url
	 * @param [isBlob] is response a blob
	 */
	public get(url: string, isBlob?: boolean): Observable<Response> {
		const newHeaders = new Headers();
		this.addAuthHeader(newHeaders);
		const options = (!isBlob) ? { headers: newHeaders } : { headers: newHeaders, responseType: ResponseContentType.Blob };
		return this.checkTokenUpdate(this.http.get(url, options));
	}

	/**
	 * Sends a post request with added auth header.
	 * @param url request url
	 * @param data form data
	 */
	public post(url: string, data: any): Observable<Response> {
		const newHeaders = new Headers();
		this.addAuthHeader(newHeaders);
		return this.checkTokenUpdate(this.http.post(url, data, { headers: newHeaders }));
	}
}
