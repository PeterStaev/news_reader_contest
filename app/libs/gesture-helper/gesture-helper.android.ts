import { GestureEventData, Label } from "ui";

export function getCharIndexAtTouchPoint(args: GestureEventData): number {
    let motionEvent: android.view.MotionEvent = args.android;
    let label = <Label>args.object;
    let layout = (<android.widget.TextView>label.android).getLayout();
    let x = motionEvent.getX();
    let y = motionEvent.getY();
    
    if (layout) {
        let line = layout.getLineForVertical(y);
        let index = layout.getOffsetForHorizontal(line, x);
        
        return index;
    }
    
    return -1;
}