"use strict";
var dashboard_intro_component_1 = require('./components/dashboard-intro.component');
var dashboard_details_component_1 = require('./components/dashboard-details.component');
exports.APP_ROUTES = [
    { path: '/', redirectTo: ['Intro'] },
    { path: '/intro', name: 'Intro', component: dashboard_intro_component_1.DashboardIntroComponent, useAsDefault: true },
    { path: '/data', name: 'Data', component: dashboard_details_component_1.DashboardDetailsComponent, useAsDefault: false },
];
//# sourceMappingURL=app.routes.js.map