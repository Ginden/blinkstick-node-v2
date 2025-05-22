import {RgbTuple} from "./rgb-tuple";
import {COLOR_KEYWORDS} from "../consts/color-keywords";

import {ColorObject} from "./color-object";

export type ColorInput = RgbTuple | ColorObject | keyof typeof COLOR_KEYWORDS;
