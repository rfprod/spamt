"use strict";
var dashboard_intro_component_1 = require('./components/dashboard-intro.component');
var dashboard_details_component_1 = require('./components/dashboard-details.component');
exports.APP_ROUTES = [
    { path: '', redirectTo: 'intro', pathMatch: 'full' },
    { path: 'intro', component: dashboard_intro_component_1.DashboardIntroComponent },
    { path: 'data', component: dashboard_details_component_1.DashboardDetailsComponent },
];
//# sourceMappingURL=app.routes.js.map