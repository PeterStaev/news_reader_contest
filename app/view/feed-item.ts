import { Page, NavigatedData, ScrollView, Label } from  "ui";
import gestures = require("ui/gestures")
import viewModule = require("ui/core/view");
import platform = require("platform");
import utils = require("utils/utils");
import frame = require("ui/frame");
import gestureHelper = require("../libs/gesture-helper/gesture-helper")
import { FeedItemModel } from "../model/feed-item";
import { NewsUrl } from "../libs/parse-helper/parse-helper";

export function onNavigatingTo(args: NavigatedData) {
    let page = <Page>args.object;  
    let model = new FeedItemModel(args.context.id, args.context.title);
    let sv = page.getViewById<ScrollView>("sv");

    page.bindingContext = model;
    model.loadData().then(view => { 
        viewModule.eachDescendant(view, (child) => {
            if (child instanceof Label) {
                (<Label>child).on(gestures.GestureTypes.tap, onLabelTap);
            }
            return true;
        });
        sv.content = view;
    });
}

function onLabelTap(args: gestures.GestureEventData) {
    let urls: Array<NewsUrl> = (<Label>args.object).bindingContext;
    let charIndex = gestureHelper.getCharIndexAtTouchPoint(args);
    
    for (let loop = 0; loop < urls.length; loop++) {
        let url = urls[loop];
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
                    console.log(`Unknown URL Platform ${url.platform}`);
                    break;
            }
            return;
        }
    }
}
