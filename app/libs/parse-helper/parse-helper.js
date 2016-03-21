"use strict";
var ui_1 = require("ui");
var span_1 = require("text/span");
var color_1 = require("color");
var formatted_string_1 = require("text/formatted-string");
var enums = require("ui/enums");
var xml = require("xml");
var builder = require("ui/builder");
var fs = require("file-system");
var video_1 = require("../../model/video");
var ParseHelper = (function () {
    function ParseHelper() {
    }
    ParseHelper._getImageSourceFromRelations = function (id) {
        var src = "";
        for (var loop = 0; loop < ParseHelper.relations.length; loop++) {
            var currentItem = ParseHelper.relations[loop];
            if (currentItem.primaryType === "bbc.mobile.news.image"
                && currentItem.content.id === id) {
                return currentItem.content.href;
            }
        }
    };
    ParseHelper._getVideoModel = function (id) {
        var videoId;
        var posterHref;
        for (var loop = 0; loop < ParseHelper.relations.length; loop++) {
            var currentItem = ParseHelper.relations[loop];
            if (currentItem.primaryType === "bbc.mobile.news.video"
                && currentItem.content.id === id) {
                videoId = currentItem.content.externalId;
                posterHref = currentItem.content.relations[0].content.href;
                break;
            }
        }
        return new video_1.VideoModel(videoId, posterHref);
    };
    ParseHelper._handleStartElement = function (elementName, attr) {
        var structureTop = ParseHelper.structure[ParseHelper.structure.length - 1];
        switch (elementName) {
            case "body":
                ParseHelper.structure = [];
                var body = new ui_1.StackLayout();
                body.orientation = enums.Orientation.vertical;
                ParseHelper.structure.push(body);
                break;
            case "paragraph":
                var paragraph = new ui_1.Label();
                paragraph.textWrap = true;
                if (attr && attr.role === "introduction") {
                    paragraph.cssClass = "Header";
                }
                else {
                    paragraph.cssClass = "Paragraph";
                }
                paragraph.formattedText = new formatted_string_1.FormattedString();
                ParseHelper.structure.push(paragraph);
                break;
            case "crosshead":
                var crosshead = new ui_1.Label();
                crosshead.textWrap = true;
                crosshead.cssClass = "Crosshead";
                crosshead.formattedText = new formatted_string_1.FormattedString();
                ParseHelper.structure.push(crosshead);
                break;
            case "italic":
                var si = void 0;
                if (structureTop instanceof span_1.Span) {
                    si = structureTop;
                }
                else {
                    si = new span_1.Span();
                    ParseHelper.structure.push(si);
                }
                si.fontAttributes = si.fontAttributes | enums.FontAttributes.Italic;
                break;
            case "bold":
                var sb = void 0;
                if (structureTop instanceof span_1.Span) {
                    sb = structureTop;
                }
                else {
                    sb = new span_1.Span();
                    ParseHelper.structure.push(sb);
                }
                sb.fontAttributes = sb.fontAttributes | enums.FontAttributes.Bold;
                break;
            case "link":
                if (!ParseHelper._urls) {
                    ParseHelper._urls = [];
                }
                var link_1 = new span_1.Span();
                link_1.underline = 1;
                link_1.foregroundColor = new color_1.Color("#BB1919");
                ParseHelper.structure.push(link_1);
                ParseHelper._urls.push({ start: structureTop.formattedText.toString().length });
                break;
            case "url":
                var lastUrl = ParseHelper._urls[ParseHelper._urls.length - 1];
                lastUrl.platform = attr.platform;
                lastUrl.href = attr.href;
                break;
            case "caption":
                ParseHelper._isCaptionIn = true;
                break;
            case "image":
                var img = new ui_1.Image();
                img.stretch = enums.Stretch.aspectFill;
                img.height = 150;
                img.src = ParseHelper._getImageSourceFromRelations(attr.id);
                ParseHelper.structure.push(img);
                break;
            case "list":
                var lst = new ui_1.StackLayout();
                lst.cssClass = "List";
                lst.orientation = enums.Orientation.vertical;
                ParseHelper.structure.push(lst);
                break;
            case "listItem":
                var bullet = new span_1.Span();
                bullet.text = "●  ";
                var lbl = new ui_1.Label();
                lbl.textWrap = true;
                lbl.cssClass = "ListItem";
                lbl.formattedText = new formatted_string_1.FormattedString();
                lbl.formattedText.spans.push(bullet);
                ParseHelper.structure.push(lbl);
                break;
            case "video":
                var videoSubView = builder.load(fs.path.join(fs.knownFolders.currentApp().path, "view/video-sub-view.xml"));
                var model = ParseHelper._getVideoModel(attr.id);
                videoSubView.bindingContext = model;
                ParseHelper.structure.push(videoSubView);
                break;
            default:
                console.log("UNKNOWN TAG " + elementName);
                break;
        }
    };
    ParseHelper._handleEndElement = function (elementName) {
        switch (elementName) {
            case "body":
                break;
            case "paragraph":
            case "listItem":
            case "crosshead":
                var label = ParseHelper.structure.pop();
                ParseHelper.structure[ParseHelper.structure.length - 1].addChild(label);
                break;
            case "image":
                var img = ParseHelper.structure.pop();
                ParseHelper.structure[ParseHelper.structure.length - 1].addChild(img);
                break;
            case "italic":
            case "bold":
            case "link":
                // Added check for nested bold/italic tags
                if (ParseHelper.structure[ParseHelper.structure.length - 1] instanceof span_1.Span) {
                    var link_2 = ParseHelper.structure.pop();
                    ParseHelper.structure[ParseHelper.structure.length - 1].formattedText.spans.push(link_2);
                    if (ParseHelper._urls) {
                        ParseHelper.structure[ParseHelper.structure.length - 1].bindingContext = ParseHelper._urls.slice();
                        ParseHelper._urls = null;
                    }
                }
                break;
            case "caption":
                ParseHelper._isCaptionIn = false;
                break;
            case "list":
                var sl = ParseHelper.structure.pop();
                ParseHelper.structure[ParseHelper.structure.length - 1].addChild(sl);
                break;
            case "video":
                var videoSubView = ParseHelper.structure.pop();
                ParseHelper.structure[ParseHelper.structure.length - 1].addChild(videoSubView);
                break;
        }
    };
    ParseHelper._handleText = function (text) {
        if (text.trim() === "")
            return;
        var structureTop = ParseHelper.structure[ParseHelper.structure.length - 1];
        if (structureTop instanceof ui_1.Label) {
            var span = new span_1.Span();
            span.text = text;
            structureTop.formattedText.spans.push(span);
        }
        else if (structureTop instanceof span_1.Span) {
            structureTop.text = text;
            if (ParseHelper._isCaptionIn) {
                ParseHelper._urls[ParseHelper._urls.length - 1].length = text.length;
            }
        }
        else {
            console.log("UNKNOWN TOP", structureTop);
        }
    };
    ParseHelper.xmlParserCallback = function (event) {
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
    };
    ParseHelper.structure = [];
    ParseHelper._isCaptionIn = false;
    return ParseHelper;
}());
exports.ParseHelper = ParseHelper;
//# sourceMappingURL=parse-helper.js.map