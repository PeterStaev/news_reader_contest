"use strict";
var label_1 = require("ui/label");
var gestures = require("ui/gestures");
var viewModule = require("ui/core/view");
var platform = require("platform");
var utils = require("utils/utils");
var frame = require("ui/frame");
var feed_item_1 = require("../model/feed-item");
function onNavigatingTo(args) {
    var page = args.object;
    var model = new feed_item_1.FeedItemModel(args.context.id, args.context.title);
    var sv = page.getViewById("sv");
    page.bindingContext = model;
    model.loadData().then(function (view) {
        if (platform.device.os === platform.platformNames.ios) {
            viewModule.eachDescendant(view, function (child) {
                if (child instanceof label_1.Label) {
                    child.on(gestures.GestureTypes.tap, onLabelTap);
                }
                return true;
            });
        }
        sv.content = view;
    });
}
exports.onNavigatingTo = onNavigatingTo;
function openMobileFeedItem(id) {
    frame.topmost().navigate({
        moduleName: "view/feed-item",
        context: {
            id: id
        }
    });
}
function onLabelTap(args) {
    var label = args.object.ios;
    var urls = args.object.bindingContext;
    var fixedAttributedText = NSMutableAttributedString.alloc().initWithAttributedString(label.attributedText);
    fixedAttributedText.addAttributeValueRange(NSFontAttributeName, label.font, NSMakeRange(0, label.attributedText.string.length));
    var tapGesture = args.ios;
    var layoutManager = NSLayoutManager.alloc().init();
    var textContainer = NSTextContainer.alloc().init();
    var textStorage = NSTextStorage.alloc().initWithAttributedString(fixedAttributedText);
    layoutManager.addTextContainer(textContainer);
    textStorage.addLayoutManager(layoutManager);
    textContainer.lineFragmentPadding = 0;
    textContainer.lineBreakMode = label.lineBreakMode;
    textContainer.maximumNumberOfLines = label.numberOfLines;
    textContainer.size = label.frame.size;
    var locationOfTouchInLabel = tapGesture.locationInView(label);
    var indexOfCharacter = layoutManager.glyphIndexForPointInTextContainer(locationOfTouchInLabel, textContainer);
    for (var loop = 0; loop < urls.length; loop++) {
        var url = urls[loop];
        if (indexOfCharacter >= url.start && indexOfCharacter < url.start + url.length) {
            switch (url.platform) {
                case "newsapps":
                    openMobileFeedItem(url.href);
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