"use strict";
var feed_item_1 = require("../model/feed-item");
function onNavigatingTo(args) {
    var page = args.object;
    var model = new feed_item_1.FeedItemModel(args.context.id, args.context.title);
    var sv = page.getViewById("sv");
    // let label = new Label();
    // label.text = args.context.id;
    // page.content = label;
    page.bindingContext = model;
    model.loadData().then(function (view) {
        sv.content = view;
    });
}
exports.onNavigatingTo = onNavigatingTo;
//# sourceMappingURL=feed-item.js.map