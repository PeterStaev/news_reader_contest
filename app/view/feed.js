"use strict";
var frame = require("ui/frame");
var feed_1 = require("../model/feed");
var platform = require("platform");
var model;
function onNavigatingTo(args) {
    var page = args.object;
    if (platform.device.os === platform.platformNames.ios) {
        UITableView.appearance().tableFooterView = UIView.alloc().initWithFrame(CGRectZero);
        UIApplication.sharedApplication().setStatusBarStyleAnimated(UIStatusBarStyle.UIStatusBarStyleLightContent, false);
    }
    if (!model) {
        model = new feed_1.FeedModel();
        page.bindingContext = model;
    }
    model.loadFeedItems();
}
exports.onNavigatingTo = onNavigatingTo;
function goToItem(args) {
    var dataItem = model.get("items")[args.index];
    frame.topmost().navigate({
        moduleName: "view/feed-item",
        context: {
            id: dataItem.id,
            title: dataItem.title
        }
    });
}
exports.goToItem = goToItem;
//# sourceMappingURL=feed.js.map