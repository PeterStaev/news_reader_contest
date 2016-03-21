import { Observable } from "data/observable";
import { GestureEventData, GridLayout } from "ui";
import { Video } from  "nativescript-videoplayer";
import http = require("http");
import platform = require("platform");

export class VideoModel extends Observable {
    private _isVideoAddedIn = false;
    
    constructor(videoId: string, posterHref: string) {
        super();
        
        this.set("videoId", videoId);
        this.set("posterHref", posterHref);
        this.set("isLoadingIn", false);
    }
    
    public startVideo (args:GestureEventData) {
        // If the video was already added do nothing
        if (this._isVideoAddedIn) {
            return;
        }
        
        this.set("isLoadingIn", true);
        http.getJSON(`http://open.live.bbc.co.uk/mediaselector/5/select/version/2.0/format/json/mediaset/journalism-http-tablet/vpid/${this.get("videoId")}/proto/http/transferformat/hls/`)
            .then((res: any) => {
                this.set("isLoadingIn", false);

                let gl = <GridLayout>args.object;
                gl.removeChildren();

                let video = new Video();
                video.src = res.media[0].connection[0].href;
                video.autoplay = true;

                gl.addChild(video); 
                
                // Androoid fix for zindex
                if (platform.device.os === platform.platformNames.android) {
                    let videoView = (<android.widget.VideoView>video.android);
                    videoView.setZOrderOnTop(true);
                    videoView.requestFocus();
                }
                
                this._isVideoAddedIn = true;
            });

    }
}