import { Page, NavigatedData } from  "ui/page";
import { ScrollView } from "ui/scroll-view";
import { FeedItemModel } from "../model/feed-item";

export function onNavigatingTo(args: NavigatedData) {
    let page = <Page>args.object;  
    let model = new FeedItemModel(args.context.id, args.context.title);
    let sv = page.getViewById<ScrollView>("sv");

    page.bindingContext = model;
    model.loadData().then(view => { 
        sv.content = view;
    });
}