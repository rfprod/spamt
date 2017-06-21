import { Injectable } from '@angular/core';

@Injectable()
export class SCgetUserTrackDownloadService {
	public appDataUrl: string = window.location.origin + '/sc/get/user/track/download?endpoint_uri=';

	public openInNewWindow(endpointUri) {
		const win = window.open(this.appDataUrl + endpointUri);
		win.onload = () => {
			setTimeout(() => {
				win.close();
			}, 1500);
		};
	}

}
