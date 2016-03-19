import { Page, NavigatedData } from  "ui/page";
import { ScrollView } from "ui/scroll-view";
import { Label } from "ui/label"
import gestures = require("ui/gestures")
import viewModule = require("ui/core/view");
import platform = require("platform");
import utils = require("utils/utils");
import frame = require("ui/frame");
import { FeedItemModel } from "../model/feed-item";
import { NewsUrl } from "../parse-helper";

export function onNavigatingTo(args: NavigatedData) {
    let page = <Page>args.object;  
    let model = new FeedItemModel(args.context.id, args.context.title);
    let sv = page.getViewById<ScrollView>("sv");

    page.bindingContext = model;
    model.loadData().then(view => { 
        if (platform.device.os === platform.platformNames.ios) {
            viewModule.eachDescendant(view, (child) => {
                if (child instanceof Label) {
                    (<Label>child).on(gestures.GestureTypes.tap, onLabelTap);
                }
                return true;
            });
        }
        sv.content = view;
    });
}

function openMobileFeedItem(id: string) {
   frame.topmost().navigate({
        moduleName: "view/feed-item", 
        context: {
            id: id
        }
    }); 
}

function onLabelTap(args: gestures.GestureEventData) {
    let label: UILabel = (<Label>args.object).ios;
    let urls: Array<NewsUrl> = (<Label>args.object).bindingContext;
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
        
    for (let loop = 0; loop < urls.length; loop++) {
        let url = urls[loop];
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
                    console.log(`Unknown URL Platform ${url.platform}`);
                    break;
            }
            return;
        }
    }
}