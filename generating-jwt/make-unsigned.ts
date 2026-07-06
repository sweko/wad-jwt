import { payload } from "./data";
import { encodeUnsigned } from "./jwt-unsigned";

const unsigned = encodeUnsigned(payload);
console.log(unsigned);