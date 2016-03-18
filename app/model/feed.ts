import { Observable } from "data/observable";
import http = require("http");

export class FeedModel extends Observable {
    constructor() {
        super();
        this.set("items", []);
        this.set("isLoadingIn", false);
    }
    
    public loadFeedItems() {
        this.set("isLoadingIn", true);
        http.getJSON("http://trevor-producer-cdn.api.bbci.co.uk/content/cps/news/world").then((res: any) => {
            let feedItems = (<Array<any>>res.relations).map(item => {
                let resultItem = {
                        id: item.content.id, 
                        title: item.content.shortName, 
                        imageHref: null, 
                        lastUpdateDate: new Date(item.content.lastUpdated), 
                        category: null
                    };
                (<Array<any>>item.content.relations).forEach(element => {
                    if (element.primaryType === "bbc.mobile.news.image" && element.secondaryType === "bbc.mobile.news.placement.index") {
                        resultItem.imageHref = element.content.href;
                    }
                    else if (element.primaryType === "bbc.mobile.news.collection") {
                        resultItem.category = {
                            id: element.content.id, 
                            name: element.content.name
                        };
                    }
                });
                
                return resultItem;
            });

            this.set("items", feedItems)
            this.set("isLoadingIn", false);
        });
    }
}