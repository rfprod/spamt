import { Pipe, PipeTransform } from '@angular/core';
/*
*	converts duration in unixtime to human-readable duration in format hh:mm:ss
*/
@Pipe({ name: 'duration'})
export class ConvertDuration implements PipeTransform {
	public transform(duration: number): string {
		duration = duration / 1000;

		let hours: any = Math.floor(duration / 3600);
		duration = duration - (hours * 3600);
		hours = (hours < 10) ? '0' + hours : hours;

		let minutes: any = Math.floor(duration / 60);
		duration = duration - (minutes * 60);
		minutes = (minutes < 10) ? '0' + minutes : minutes;

		let seconds: any = Math.round(duration);
		seconds = (seconds < 10) ? '0' + seconds : seconds;

		return hours + ':' + minutes + ':' + seconds;
	}
}
