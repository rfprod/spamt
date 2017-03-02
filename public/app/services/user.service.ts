import { Injectable } from '@angular/core';

@Injectable()
export class UserService {
	constructor (public window: Window) {}

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
		twitter_token: '',
		soundcloud_token: '',
	};

	public modelKeys(): any[] {
		return Object.keys(this.model);
	}

	public saveUser(): void {
		this.window.localStorage.setItem('SPAMT', JSON.stringify(this.model));
	}

	public restoreUser(callback): void {
		if (this.window.localStorage.getItem('SPAMT') && this.window.localStorage.getItem('SPAMT') !== 'null' && typeof this.window.localStorage.getItem('SPAMT') !== 'undefined') {
			this.model = JSON.parse(this.window.localStorage.getItem('SPAMT'));
			/*
			*	this.window.localStorage.getItem('SPAMT') returns null as a string when SPAMT does not exist in localStorage
			*/
			console.log('this.window.localStorage.getItem(\'SPAMT\'): ', this.window.localStorage.getItem('SPAMT'));
			if (callback) { callback(); }
		}
	}

	public resetUser(): void {
		for (let key of this.modelKeys()) {
			this.model[key] = '';
		}
		this.saveUser();
	}
}
