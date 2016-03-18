import { Page, NavigatedData } from  "ui/page";
import { ItemEventData } from "ui/list-view";
import frame = require("ui/frame");
import { FeedModel } from "../model/feed";
import platform = require("platform");

let model: FeedModel;

export function onNavigatingTo(args: NavigatedData) {
    let page = <Page>args.object; 
    
    if (platform.device.os === platform.platformNames.ios) {
        UITableView.appearance().tableFooterView = UIView.alloc().initWithFrame(CGRectZero);
        UIApplication.sharedApplication().setStatusBarStyleAnimated(UIStatusBarStyle.UIStatusBarStyleLightContent, false);
    }
    
    if (!model) {
        model = new FeedModel();
        page.bindingContext = model;
    } 
    model.loadFeedItems();
}

export function goToItem(args: ItemEventData) {
    let dataItem = model.get("items")[args.index];

    frame.topmost().navigate({
        moduleName: "view/feed-item", 
        context: {
            id: dataItem.id, 
            title: dataItem.title
        }
    });
}