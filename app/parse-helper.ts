import { StackLayout } from "ui/layouts/stack-layout";
import { Label } from "ui/label";
import enums = require("ui/enums");
import { Span } from "text/span";
import { Image } from "ui/image";
import { Color } from "color";
import { FormattedString } from "text/formatted-string";
import xml = require("xml");

export class ParseHelper {
    public static structure: Array<any>;
    public static relations: Array<any>;
    private static _isUrlIn = false;
    
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
    
    private static _handleStartElement(elementName: string, attr: any) {
        switch (elementName) {
            case "body":
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
                if (ParseHelper.structure[ParseHelper.structure.length - 1] instanceof Span) {
                    si = ParseHelper.structure[ParseHelper.structure.length - 1];
                }
                else {
                    si = new Span();
                    ParseHelper.structure.push(si);
                }
                si.fontAttributes = si.fontAttributes | enums.FontAttributes.Italic;
                break; 

            case "bold":
                let sb: Span;
                if (ParseHelper.structure[ParseHelper.structure.length - 1] instanceof Span) {
                    sb = ParseHelper.structure[ParseHelper.structure.length - 1];
                }
                else {
                    sb = new Span();
                    ParseHelper.structure.push(sb);
                }
                
                sb.fontAttributes = sb.fontAttributes | enums.FontAttributes.Bold;
                break; 
                
            case "link":
                let link = new Span();
                link.underline = 1;
                link.foregroundColor = new Color("#BB1919");
                ParseHelper.structure.push(link)
                break;
            
            case "url":
                ParseHelper._isUrlIn = true;
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
                    break;
                }
                
            case "url":
                ParseHelper._isUrlIn = false;
                break;
                
            case "list":
                let sl: StackLayout = ParseHelper.structure.pop();
                (<StackLayout>ParseHelper.structure[ParseHelper.structure.length - 1]).addChild(sl);
                break;
        }
    }
    private static _handleText(text: string) {
        if (text === "") return;
        
        let structureTop = ParseHelper.structure[ParseHelper.structure.length - 1];
        
        if (ParseHelper._isUrlIn) {
            // TODO
        }
        else if (structureTop instanceof Label) {
            let span = new Span();
            span.text = text;
            (<Label>structureTop).formattedText.spans.push(span);
        }
        else if (structureTop instanceof Span) {
            (<Span>structureTop).text = text;
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