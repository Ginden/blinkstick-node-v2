import {AnimationDescription} from "../../animation-description";
import {ComplexFrame} from "../../complex-frame";
import {SimpleFrame} from "../../simple-frame";

/**
 * Sets maximum duration for an animation.
 * The last frame can be shortened to fit the maximum duration.
 */
export async function* limitDuration(animation: AnimationDescription, maximumDuration: number): AsyncIterable<ComplexFrame | SimpleFrame> {
    const t0 = performance.now();

    for await (const frame of animation) {
        const now = performance.now();
        const {duration} = frame;
        if (now - t0 + duration > maximumDuration) {
            const remainingTime = maximumDuration - (now - t0);
            if (frame instanceof SimpleFrame) {
                yield new SimpleFrame(frame.rgb, remainingTime);
            } else if (frame instanceof ComplexFrame) {
                yield new ComplexFrame(frame.colors, remainingTime);
            }
            break;
        } else {
            yield frame;
        }

    }
}
