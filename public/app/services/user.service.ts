import { Injectable, Inject } from '@angular/core';

@Injectable()
export class UserService {

	constructor(
		@Inject('Window') private window: Window
	) {
		this.restoreUser();
	}

	public model: any = {
		email: '',
		role: '',
		login: '',
		full_name: '',
		user_token: '',
		last_login: '',
		registered: '',
		analyser_query: '',
		analyser_user_id: '',
		analyser_user_uri: '',
		/*
		*	Note on OAuth tokens
		*
		*	following OAuth tokens are not access tokens, these are OAuth request tokens
		*
		*	request tokens are stored in db for each user session,
		*	as well as a key pair: access_token / token_secret,
		*	which are actually used to make requests to Twitter API
		*
		*	request tokens identify further user requests
		*/
		twitter_oauth_token: '',
		soundcloud_oauth_token: '',
	};

	public getUser(): any {
		return this.model;
	}

	public modelKeys(): string[] {
		return Object.keys(this.model);
	}

	public saveUser(newValues: any): void {
		console.log('SaveUser', newValues);
		const validKeys = this.modelKeys();
		for (const key of validKeys) {
			if (newValues.hasOwnProperty(key)) {
				this.model[key] = newValues[key];
			}
		}
		this.window.localStorage.setItem('SPAMT', JSON.stringify(this.model));
	}

	public restoreUser(callback?: any): void {
		if (this.window.localStorage.getItem('SPAMT') && this.window.localStorage.getItem('SPAMT') !== 'null' && typeof this.window.localStorage.getItem('SPAMT') !== 'undefined') {
			this.model = JSON.parse(this.window.localStorage.getItem('SPAMT'));
			/*
			*	this.window.localStorage.getItem('SPAMT') returns null as a string when SPAMT does not exist in localStorage
			*/
			console.log('this.window.localStorage.getItem(\'SPAMT\'): ', this.window.localStorage.getItem('SPAMT'));
			if (callback) { callback(); }
		} else {
			this.window.localStorage.setItem('SPAMT', JSON.stringify(this.model));
		}
	}

	public resetUser(): void {
		for (const key of this.modelKeys()) {
			this.model[key] = '';
		}
		this.window.localStorage.setItem('SPAMT', JSON.stringify(this.model));
	}
}
