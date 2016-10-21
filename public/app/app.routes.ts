import { DashboardIntroComponent } from './components/dashboard-intro.component';
import { DashboardDetailsComponent } from './components/dashboard-details.component';

export var APP_ROUTES: any[] = [
	{path: '/', redirectTo: ['Intro']},
	{path: '/intro', name: 'Intro', component: DashboardIntroComponent, useAsDefault: true},
	{path: '/data', name: 'Data', component: DashboardDetailsComponent, useAsDefault: false},
];
