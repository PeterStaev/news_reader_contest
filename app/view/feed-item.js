"use strict";
var ui_1 = require("ui");
var gestures = require("ui/gestures");
var viewModule = require("ui/core/view");
var utils = require("utils/utils");
var frame = require("ui/frame");
var gestureHelper = require("../libs/gesture-helper/gesture-helper");
var feed_item_1 = require("../model/feed-item");
function onNavigatingTo(args) {
    var page = args.object;
    var model = new feed_item_1.FeedItemModel(args.context.id, args.context.title);
    var sv = page.getViewById("sv");
    page.bindingContext = model;
    model.loadData().then(function (view) {
        viewModule.eachDescendant(view, function (child) {
            if (child instanceof ui_1.Label) {
                child.on(gestures.GestureTypes.tap, onLabelTap);
            }
            return true;
        });
        sv.content = view;
    });
}
exports.onNavigatingTo = onNavigatingTo;
function onLabelTap(args) {
    var urls = args.object.bindingContext;
    var charIndex = gestureHelper.getCharIndexAtTouchPoint(args);
    for (var loop = 0; loop < urls.length; loop++) {
        var url = urls[loop];
        if (charIndex >= url.start && charIndex < url.start + url.length) {
            switch (url.platform) {
                case "newsapps":
                    frame.topmost().navigate({
                        moduleName: "view/feed-item",
                        context: {
                            id: url.href
                        }
                    });
                    break;
                case "highweb":
                case "enhancedmobile":
                    utils.openUrl(url.href);
                    break;
                default:
                    console.log("Unknown URL Platform " + url.platform);
                    break;
            }
            return;
        }
    }
}
//# sourceMappingURL=feed-item.js.map