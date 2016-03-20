"use strict";
function getCharIndexAtTouchPoint(args) {
    var motionEvent = args.android;
    var label = args.object;
    var layout = label.android.getLayout();
    var x = motionEvent.getX();
    var y = motionEvent.getY();
    if (layout) {
        var line = layout.getLineForVertical(y);
        var index_1 = layout.getOffsetForHorizontal(line, x);
        return index_1;
    }
    return -1;
}
exports.getCharIndexAtTouchPoint = getCharIndexAtTouchPoint;
//# sourceMappingURL=gesture-helper.android.js.map