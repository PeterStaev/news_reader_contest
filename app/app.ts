import application = require("application");
import moment = require("moment");

application.resources.diffFormat = (value: Date) => {
    let x = moment(value);
    let y = moment();
    let diffMins = y.diff(x, "minutes");
    let diffHrs = y.diff(x, "hours");
    
    if (diffMins < 60) {
        return `${diffMins} minutes ago`;
    }
    else {
        return `${diffHrs} hour${(diffHrs > 1 ? "s" : "" )} ago`;
    }
}

application.start({ moduleName: "view/feed" });
