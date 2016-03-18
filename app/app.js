"use strict";
var application = require("application");
var moment = require("moment");
application.resources.diffFormat = function (value) {
    var x = moment(value);
    var y = moment();
    var diffMins = y.diff(x, "minutes");
    var diffHrs = y.diff(x, "hours");
    if (diffMins < 60) {
        return diffMins + " minutes ago";
    }
    else {
        return diffHrs + " hour" + (diffHrs > 1 ? "s" : "") + " ago";
    }
};
application.start({ moduleName: "view/feed" });
//# sourceMappingURL=app.js.map