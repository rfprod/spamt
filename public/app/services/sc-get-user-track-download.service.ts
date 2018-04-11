import { Injectable, Inject } from '@angular/core';

@Injectable()
export class SCgetUserTrackDownloadService {

	constructor(
		@Inject('Window') private window: Window
	) {}

	public appDataUrl: string = this.window.location.origin + '/api/sc/get/user/track/download?endpoint_uri=';

	public openInNewWindow(endpointUri) {
		const win = window.open(this.appDataUrl + endpointUri);
		win.onload = () => {
			setTimeout(() => {
				win.close();
			}, 1500);
		};
	}

}
