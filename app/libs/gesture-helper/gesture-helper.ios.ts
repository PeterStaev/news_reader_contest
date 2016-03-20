import { GestureEventData, Label } from "ui";

export function getCharIndexAtTouchPoint(args: GestureEventData): number {
    let label: UILabel = (<Label>args.object).ios;
    let fixedAttributedText: NSMutableAttributedString = NSMutableAttributedString.alloc().initWithAttributedString(label.attributedText);
    fixedAttributedText.addAttributeValueRange(NSFontAttributeName, label.font, NSMakeRange(0, label.attributedText.string.length))
    
    let tapGesture: UITapGestureRecognizer = args.ios;
    let layoutManager: NSLayoutManager = NSLayoutManager.alloc().init();
    let textContainer: NSTextContainer = NSTextContainer.alloc().init();
    let textStorage: NSTextStorage= NSTextStorage.alloc().initWithAttributedString(fixedAttributedText);
    
    layoutManager.addTextContainer(textContainer);
    textStorage.addLayoutManager(layoutManager);
    textContainer.lineFragmentPadding = 0;
    textContainer.lineBreakMode = label.lineBreakMode;
    textContainer.maximumNumberOfLines = label.numberOfLines;
    textContainer.size = label.frame.size;

    let locationOfTouchInLabel = tapGesture.locationInView(label);
    let indexOfCharacter = 
        layoutManager.glyphIndexForPointInTextContainer(locationOfTouchInLabel, textContainer);
        
    return indexOfCharacter;
}