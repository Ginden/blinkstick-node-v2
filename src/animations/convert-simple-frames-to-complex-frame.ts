import {SimpleFrame} from "./simple-frame";
import {ComplexFrame} from "./complex-frame";
import {RgbTuple} from "../types";
import { assert } from "tsafe";

export function *convertSimpleFramesToComplexFrame(
    simpleFrames: (Iterable<SimpleFrame>)[],
    fillMissingEndWith: RgbTuple = [0, 0, 0],
    ledCount: number = simpleFrames.length
): Iterable<ComplexFrame> {
    assert(ledCount > 0, "ledCount must be greater than 0");
    assert(simpleFrames.length === ledCount, "simpleFrames length must be equal to ledCount");
    // TODO: implement this function

}
