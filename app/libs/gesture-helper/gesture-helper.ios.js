"use strict";
function getCharIndexAtTouchPoint(args) {
    var label = args.object.ios;
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
    return indexOfCharacter;
}
exports.getCharIndexAtTouchPoint = getCharIndexAtTouchPoint;
//# sourceMappingURL=gesture-helper.ios.js.map