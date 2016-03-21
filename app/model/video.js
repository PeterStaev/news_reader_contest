"use strict";
var observable_1 = require("data/observable");
var nativescript_videoplayer_1 = require("nativescript-videoplayer");
var http = require("http");
var platform = require("platform");
var VideoModel = (function (_super) {
    __extends(VideoModel, _super);
    function VideoModel(videoId, posterHref) {
        _super.call(this);
        this._isVideoAddedIn = false;
        this.set("videoId", videoId);
        this.set("posterHref", posterHref);
        this.set("isLoadingIn", false);
    }
    VideoModel.prototype.startVideo = function (args) {
        var _this = this;
        // If the video was already added do nothing
        if (this._isVideoAddedIn) {
            return;
        }
        this.set("isLoadingIn", true);
        http.getJSON("http://open.live.bbc.co.uk/mediaselector/5/select/version/2.0/format/json/mediaset/journalism-http-tablet/vpid/" + this.get("videoId") + "/proto/http/transferformat/hls/")
            .then(function (res) {
            _this.set("isLoadingIn", false);
            var gl = args.object;
            gl.removeChildren();
            var video = new nativescript_videoplayer_1.Video();
            video.src = res.media[0].connection[0].href;
            video.autoplay = true;
            gl.addChild(video);
            // Androoid fix for zindex
            if (platform.device.os === platform.platformNames.android) {
                var videoView = video.android;
                videoView.setZOrderOnTop(true);
                videoView.requestFocus();
            }
            _this._isVideoAddedIn = true;
        });
    };
    return VideoModel;
}(observable_1.Observable));
exports.VideoModel = VideoModel;
//# sourceMappingURL=video.js.map