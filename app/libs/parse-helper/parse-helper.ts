import { StackLayout, Label, Image } from "ui";
import { Span } from "text/span";
import { Color } from "color";
import { FormattedString } from "text/formatted-string";
import enums = require("ui/enums");
import xml = require("xml");
import builder = require("ui/builder");
import fs = require("file-system");
import { VideoModel } from "../../model/video";

export interface NewsUrl {
    start?:number;
    length?: number;
    href?: string;
    platform?: "highweb" | "newsapps" | "enhancedmobile";
}

export class ParseHelper {
    public static structure: Array<any> = [];
    public static relations: Array<any>;
    private static _urls: Array<NewsUrl>
    private static _isCaptionIn = false;
    
    private static _getImageSourceFromRelations(id: string) {
        let src = "";
        
        for (let loop = 0; loop < ParseHelper.relations.length; loop++) {
            let currentItem = ParseHelper.relations[loop];
            if (currentItem.primaryType === "bbc.mobile.news.image"
                && currentItem.content.id === id) {
                return currentItem.content.href;
            }
        }
    }
    
    private static _getVideoModel(id: string): VideoModel {
        let videoId: string;
        let posterHref: string;
        
        for (let loop = 0; loop < ParseHelper.relations.length; loop++) {
            let currentItem = ParseHelper.relations[loop];
            if (currentItem.primaryType === "bbc.mobile.news.video"
                && currentItem.content.id === id) {
                videoId = currentItem.content.externalId;
                posterHref = currentItem.content.relations[0].content.href;
                break;
            }
        }
        
        return new VideoModel(videoId, posterHref);
    }
    
    private static _handleStartElement(elementName: string, attr: any) {
        let structureTop = ParseHelper.structure[ParseHelper.structure.length - 1];
        
        switch (elementName) {
            case "body":
                ParseHelper.structure = [];
                
                let body = new StackLayout();
                body.orientation = enums.Orientation.vertical; 
                ParseHelper.structure.push(body);
                break;
                
            case "paragraph":
                let paragraph = new Label();
                paragraph.textWrap = true;
                if (attr && attr.role === "introduction") {
                    paragraph.cssClass = "Header";
                }
                else {
                    paragraph.cssClass = "Paragraph";
                }
                paragraph.formattedText = new FormattedString();
                ParseHelper.structure.push(paragraph);
                break;
                
            case "crosshead":
                let crosshead = new Label();
                crosshead.textWrap = true;
                crosshead.cssClass = "Crosshead";
                crosshead.formattedText = new FormattedString();
                ParseHelper.structure.push(crosshead);
                break;
                
            case "italic":
                let si: Span;
                if (structureTop instanceof Span) {
                    si = structureTop;
                }
                else {
                    si = new Span();
                    ParseHelper.structure.push(si);
                }
                si.fontAttributes = si.fontAttributes | enums.FontAttributes.Italic;
                break; 

            case "bold":
                let sb: Span;
                if (structureTop instanceof Span) {
                    sb = structureTop;
                }
                else {
                    sb = new Span();
                    ParseHelper.structure.push(sb);
                }
                
                sb.fontAttributes = sb.fontAttributes | enums.FontAttributes.Bold;
                break; 
                
            case "link":
                if (!ParseHelper._urls) {
                    ParseHelper._urls = [];
                }
                let link = new Span();
                link.underline = 1;
                link.foregroundColor = new Color("#BB1919");
                ParseHelper.structure.push(link);
                ParseHelper._urls.push({start: (<Label>structureTop).formattedText.toString().length});
                break;
            
            case "url":
                let lastUrl = ParseHelper._urls[ParseHelper._urls.length - 1];
                lastUrl.platform = attr.platform;
                lastUrl.href = attr.href;
                break;
                
            case "caption":
                ParseHelper._isCaptionIn = true;
                break;
                
            case "image":
                let img = new Image();
                img.stretch = enums.Stretch.aspectFill;
                img.height = 150;
                img.src = ParseHelper._getImageSourceFromRelations(attr.id);
                ParseHelper.structure.push(img);
                break;
                
            case "list":
                let lst = new StackLayout();
                lst.cssClass = "List";
                lst.orientation = enums.Orientation.vertical;
                ParseHelper.structure.push(lst);
                break;

            case "listItem":
                let bullet = new Span();
                bullet.text = "●  ";

                let lbl = new Label();
                lbl.textWrap = true;
                lbl.cssClass = "ListItem";
                lbl.formattedText = new FormattedString();
                lbl.formattedText.spans.push(bullet);

                ParseHelper.structure.push(lbl);
                break;
                
            case "video":
                let videoSubView = builder.load(fs.path.join(fs.knownFolders.currentApp().path, "view/video-sub-view.xml"));
                let model = ParseHelper._getVideoModel(attr.id);
                videoSubView.bindingContext = model;
                ParseHelper.structure.push(videoSubView);
                break;
                
            default:
                console.log(`UNKNOWN TAG ${elementName}`)
                break;
        }
    }
    private static _handleEndElement(elementName: string) {
        switch (elementName) {
            case "body":
                break;
                
            case "paragraph":
            case "listItem":
            case "crosshead":
                let label: Label = ParseHelper.structure.pop();
                if (ParseHelper._urls) {
                    label.bindingContext = ParseHelper._urls.slice();
                    ParseHelper._urls = null;
                }
                (<StackLayout>ParseHelper.structure[ParseHelper.structure.length - 1]).addChild(label);
                break;
            
            case "image":
                let img: Image = ParseHelper.structure.pop();
                (<StackLayout>ParseHelper.structure[ParseHelper.structure.length - 1]).addChild(img);
                break;
            
            case "italic":
            case "bold":
            case "link":
                // Added check for nested bold/italic tags
                if (ParseHelper.structure[ParseHelper.structure.length - 1] instanceof Span) {
                    let link: Span = ParseHelper.structure.pop();
                    (<Label>ParseHelper.structure[ParseHelper.structure.length - 1]).formattedText.spans.push(link);
                }
                break;
                
            case "caption":
                ParseHelper._isCaptionIn = false;
                break;

            case "list":
                let sl: StackLayout = ParseHelper.structure.pop();
                (<StackLayout>ParseHelper.structure[ParseHelper.structure.length - 1]).addChild(sl);
                break;
                
            case "video":
                let videoSubView = ParseHelper.structure.pop();
                (<StackLayout>ParseHelper.structure[ParseHelper.structure.length - 1]).addChild(videoSubView);
                break;
        }
    }
    private static _handleText(text: string) {
        if (text.trim() === "") return;
        
        let structureTop = ParseHelper.structure[ParseHelper.structure.length - 1];
        
        if (structureTop instanceof Label) {
            let span = new Span();
            span.text = text;
            (<Label>structureTop).formattedText.spans.push(span);
        }
        else if (structureTop instanceof Span) {
            (<Span>structureTop).text = text;
            if (ParseHelper._isCaptionIn) {
                ParseHelper._urls[ParseHelper._urls.length - 1].length = text.length;
            }
        }
        else {
            console.log("UNKNOWN TOP", structureTop);
        }
    }
    public static xmlParserCallback(event: xml.ParserEvent) {
        try {
            switch (event.eventType) {
                case xml.ParserEventType.StartElement:
                    ParseHelper._handleStartElement(event.elementName, event.attributes);
                    break;
                    
                case xml.ParserEventType.Text:
                    ParseHelper._handleText(event.data);
                    break;
                    
                case xml.ParserEventType.EndElement:
                    ParseHelper._handleEndElement(event.elementName);
                    break;
            }
        }
        catch (e) {
            console.log("ERROR", e);
        }
    }
}
