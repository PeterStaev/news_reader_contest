import { Observable } from "data/observable";
import { View } from "ui/core/view";
import http = require("http");
import xml = require("xml");
import { ParseHelper } from "../parse-helper";

export class FeedItemModel extends Observable {
    constructor(id: string, title: string) {
        super();
        this.set("id", id);
        this.set("title", title);
        this.set("isLoadingIn", false);
    }
    
    public loadData(): Promise<View> {
        this.set("isLoadingIn", true);
        return new Promise<View>((resolve, reject) => {
            http.getJSON(`http://trevor-producer-cdn.api.bbci.co.uk/content${this.get("id")}`).then((res: any) => {
                let parser = new xml.XmlParser(ParseHelper.xmlParserCallback, (error) => { console.log(`ERROR PARSE: ${error.message}`)});

                ParseHelper.structure = [];
                ParseHelper.relations = res.relations;
                parser.parse(res.body);
                
                console.log("FINISHED");
                this.set("isLoadingIn", false);
                resolve(ParseHelper.structure[0]);
            });
        });
    }
    
}