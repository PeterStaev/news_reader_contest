"use strict";
var observable_1 = require("data/observable");
var http = require("http");
var FeedModel = (function (_super) {
    __extends(FeedModel, _super);
    function FeedModel() {
        _super.call(this);
        this.set("items", []);
        this.set("isLoadingIn", false);
    }
    FeedModel.prototype.loadFeedItems = function () {
        var _this = this;
        this.set("isLoadingIn", true);
        http.getJSON("http://trevor-producer-cdn.api.bbci.co.uk/content/cps/news/world").then(function (res) {
            var feedItems = res.relations.map(function (item) {
                var resultItem = {
                    id: item.content.id,
                    title: item.content.shortName,
                    imageHref: null,
                    lastUpdateDate: new Date(item.content.lastUpdated),
                    category: null
                };
                item.content.relations.forEach(function (element) {
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
            _this.set("items", feedItems);
            _this.set("isLoadingIn", false);
        });
    };
    return FeedModel;
}(observable_1.Observable));
exports.FeedModel = FeedModel;
//# sourceMappingURL=feed.js.map