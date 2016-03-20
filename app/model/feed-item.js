"use strict";
var observable_1 = require("data/observable");
var http = require("http");
var xml = require("xml");
var parse_helper_1 = require("../libs/parse-helper/parse-helper");
var FeedItemModel = (function (_super) {
    __extends(FeedItemModel, _super);
    function FeedItemModel(id, title) {
        _super.call(this);
        this.set("id", id);
        this.set("title", title || "");
        this.set("isLoadingIn", false);
    }
    FeedItemModel.prototype.loadData = function () {
        var _this = this;
        this.set("isLoadingIn", true);
        return new Promise(function (resolve, reject) {
            http.getJSON("http://trevor-producer-cdn.api.bbci.co.uk/content" + _this.get("id")).then(function (res) {
                var parser = new xml.XmlParser(parse_helper_1.ParseHelper.xmlParserCallback, function (error) { console.log("ERROR PARSE: " + error.message); });
                parse_helper_1.ParseHelper.relations = res.relations;
                parser.parse(res.body);
                _this.set("title", res.shortName);
                _this.set("isLoadingIn", false);
                resolve(parse_helper_1.ParseHelper.structure[0]);
            });
        });
    };
    return FeedItemModel;
}(observable_1.Observable));
exports.FeedItemModel = FeedItemModel;
//# sourceMappingURL=feed-item.js.map