import { assertThrows } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { pack } from "../mod.ts"
import { assertEqualsBuf } from "./common.ts"

Deno.test("test unknown package", () => {
  assertThrows(() => pack(">z", 2), "pack unknown package")
})

Deno.test("test bool", () => {
  assertEqualsBuf(pack("?", true), new Uint8Array([1]).buffer, "bool True")
  assertEqualsBuf(pack("?", false), new Uint8Array([0]).buffer, "bool False")
})

Deno.test("test int32", () => {
  assertEqualsBuf(pack(">i", 0), new Uint8Array([0, 0, 0, 0]).buffer, "BE 0 as int32")
  assertEqualsBuf(pack(">i", 1), new Uint8Array([0, 0, 0, 1]).buffer, "BE 1 as int32")
  assertEqualsBuf(pack("<i", 1), new Uint8Array([1, 0, 0, 0]).buffer, "LE 1 as int32")
  assertEqualsBuf(pack(">i", -1), new Uint8Array([255, 255, 255, 255]).buffer, "BE -1 as int32")
  assertEqualsBuf(pack(">i", 2 ** 31 - 1), new Uint8Array([127, 255, 255, 255]).buffer, "BE Max_value as int32")
  assertThrows(() => pack(">i", 2 ** 32), "big-endian 2**32 as int32")
})

Deno.test("test uint32", () => {
  assertEqualsBuf(pack(">I", 0), new Uint8Array([0, 0, 0, 0]).buffer, "BE 0 as uint32")
  assertEqualsBuf(pack(">I", 1), new Uint8Array([0, 0, 0, 1]).buffer, "BE 1 as uint32")
  assertEqualsBuf(pack("<I", 1), new Uint8Array([1, 0, 0, 0]).buffer, "LE 1 as uint32")
  assertEqualsBuf(pack(">I", 2 ** 32 - 1), new Uint8Array([255, 255, 255, 255]).buffer, "uint32 max value")
  assertThrows(() => pack(">I", -1), "big-endian -1 as uint32")
})

Deno.test("test int16", () => {
  assertEqualsBuf(pack(">h", 0), new Uint8Array([0, 0]).buffer, "BE 0 as int16")
  assertEqualsBuf(pack(">h", 1), new Uint8Array([0, 1]).buffer, "BE 1 as int16")
  assertEqualsBuf(pack("<h", 1), new Uint8Array([1, 0]).buffer, "LE 1 as int16")
  assertEqualsBuf(pack(">h", -1), new Uint8Array([255, 255]).buffer, "BE -1 as int16")
  assertEqualsBuf(pack(">h", 2 ** 15 - 1), new Uint8Array([127, 255]).buffer, "BE Max_value as int16")
  assertThrows(() => pack(">h", 2 ** 16), "BE 2**32 as int16")
})

Deno.test("test uint16", () => {
  assertEqualsBuf(pack(">H", 0), new Uint8Array([0, 0]).buffer, "BE 0 as uint16")
  assertEqualsBuf(pack(">H", 1), new Uint8Array([0, 1]).buffer, "BE 1 as uint16")
  assertEqualsBuf(pack("<H", 1), new Uint8Array([1, 0]).buffer, "LE 1 as uint16")
  assertEqualsBuf(pack(">H", 2 ** 16 - 1), new Uint8Array([255, 255]).buffer, "BE Max_value as uint16")
  assertThrows(() => pack(">H", 2 ** 16), "BE 2**32 as uint16")
})

Deno.test("test int8", () => {
  assertEqualsBuf(pack("b", 1), new Uint8Array([1]).buffer, "1 as int8")
  assertEqualsBuf(pack("b", -1), new Uint8Array([255]).buffer, "-1 as int8")
  assertEqualsBuf(pack("b", 127), new Uint8Array([127]).buffer, "Max_value as int8")
  assertEqualsBuf(pack("b", -128), new Uint8Array([128]).buffer, "Min_value as int8")
  assertThrows(() => pack("b", 128), "over max as int8")
  assertThrows(() => pack("b", -129), "under min as int8")
})

Deno.test("test uint8", () => {
  assertEqualsBuf(pack(">B", 0), new Uint8Array([0]).buffer, "0 as uint8")
  assertEqualsBuf(pack(">B", 1), new Uint8Array([1]).buffer, "1 as uint8")
  assertEqualsBuf(pack(">B", 255), new Uint8Array([255]).buffer, "Max_value as uint8")
  assertThrows(() => pack("B", 256), "over max as uint8")
  assertThrows(() => pack("B", -1), "under min as uint8")
})

Deno.test("test float32 BE", () => {
  assertEqualsBuf(pack(">f", 0), new Uint8Array([0, 0, 0, 0]).buffer, "0 as float")
  assertEqualsBuf(pack(">f", .000001), new Uint8Array([53, 134, 55, 189]).buffer, ".000001 as float")
  assertEqualsBuf(pack(">f", 1), new Uint8Array([63, 128, 0, 0]).buffer, "1 as float")
  assertEqualsBuf(pack(">f", -1), new Uint8Array([191, 128, 0, 0]).buffer, "-1 as float")
  assertEqualsBuf(pack(">f", 1024), new Uint8Array([68, 128, 0, 0]).buffer, "1024 as float")
  assertEqualsBuf(pack(">f", 1024.1), new Uint8Array([68, 128, 3, 51]).buffer, "1024.1 as float")
})

Deno.test("test float32 LE", () => {
  assertEqualsBuf(pack("<f", 0), new Uint8Array([0, 0, 0, 0]).buffer, "0 as float LE")
  assertEqualsBuf(pack("<f", .000001), new Uint8Array([189, 55, 134, 53]).buffer, ".000001 as float LE")
  assertEqualsBuf(pack("<f", 1), new Uint8Array([0, 0, 128, 63]).buffer, "1 as float LE")
  assertEqualsBuf(pack("<f", -1), new Uint8Array([0, 0, 128, 191]).buffer, "-1 as float LE")
  assertEqualsBuf(pack("<f", 1024), new Uint8Array([0, 0, 128, 68]).buffer, "1024 as float LE")
  assertEqualsBuf(pack("<f", 1024.1), new Uint8Array([51, 3, 128, 68]).buffer, "1024.1 as float LE")
})

Deno.test("test float64 BE", () => {
  assertEqualsBuf(pack(">d", 0), new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]).buffer, "0 as double BE")
  assertEqualsBuf(pack(">d", .000001), new Uint8Array([62, 176, 198, 247, 160, 181, 237, 141]).buffer, ".000001 as double BE")
  assertEqualsBuf(pack(">d", 1), new Uint8Array([63, 240, 0, 0, 0, 0, 0, 0]).buffer, "1 as double BE")
  assertEqualsBuf(pack(">d", -1), new Uint8Array([191, 240, 0, 0, 0, 0, 0, 0]).buffer, "-1 as double BE")
  assertEqualsBuf(pack(">d", 1024), new Uint8Array([64, 144, 0, 0, 0, 0, 0, 0]).buffer, "1024 as double BE")
  assertEqualsBuf(pack(">d", 1024.1), new Uint8Array([64, 144, 0, 102, 102, 102, 102, 102]).buffer, "1024.1 as double BE")
})

Deno.test("test float64 LE", () => {
  assertEqualsBuf(pack("<d", 0), new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]).buffer, "0 as double LE")
  assertEqualsBuf(pack("<d", .000001), new Uint8Array([141, 237, 181, 160, 247, 198, 176, 62]).buffer, ".000001 as double LE")
  assertEqualsBuf(pack("<d", 1), new Uint8Array([0, 0, 0, 0, 0, 0, 240, 63]).buffer, "1 as double LE")
  assertEqualsBuf(pack("<d", -1), new Uint8Array([0, 0, 0, 0, 0, 0, 240, 191]).buffer, "-1 as double LE")
  assertEqualsBuf(pack("<d", 1024), new Uint8Array([0, 0, 0, 0, 0, 0, 144, 64]).buffer, "1024 as double LE")
  assertEqualsBuf(pack("<d", 1024.1), new Uint8Array([102, 102, 102, 102, 102, 0, 144, 64]).buffer, "1024.1 as double LE")
})

// deno-lint-ignore no-unused-vars
const float16_tests = [
  {
    name: "0",
    value: 0,
    exposant: 0,
    mantisse: 0,
    bytes: new Uint8Array([0x00, 0x00]),
  },
  {
    name: "smallest positive subnormal number",
    value: 0.000000059604645, // 1.40129846432e-45
    exposant: 0,
    mantisse: 1,
    bytes: new Uint8Array([0x00, 0x01]),
  },
  {
    name: "largest positive subnormal number",
    value: 0.000060975552,
    exposant: 0,
    mantisse: 1023,
    bytes: new Uint8Array([0x3f, 0xff]),
  },
  {
    name: "smallest positive normal number",
    value: 0.00006103515625,
    exposant: 1,
    mantisse: 0,
    bytes: new Uint8Array([0x40, 0x00]),
  },
  {
    name: "nearest value to 1/3",
    // value: 0.333251953125, // 0.33325195
    value: 0.33325195,
    exposant: 13,
    mantisse: 341,
    bytes: new Uint8Array([0x35, 0x55]),
  },
  {
    name: "largest positive normal number",
    value: 0.99951172,
    exposant: 14,
    mantisse: 1023,
    bytes: new Uint8Array([0x3b, 0xff]),
  },
  {
    name: "one",
    value: 1,
    exposant: 15,
    mantisse: 0,
    bytes: new Uint8Array([0x3c, 0x00]),
  },
  {
    name: "smallest number larger than one",
    value: 1.00097656,
    exposant: 15,
    mantisse: 1,
    bytes: new Uint8Array([0x3c, 0x01]),
  },
  {
    name: "largest normal number",
    value: 65504,
    exposant: 30,
    mantisse: 1023,
    bytes: new Uint8Array([0x7b, 0xff]),
  },
  {
    name: "infinity",
    value: Infinity,
    exposant: 31,
    mantisse: 0,
    bytes: new Uint8Array([0x7c, 0x00]),
  },
  {
    name: "-0",
    value: -0,
    exposant: 0,
    mantisse: 0,
    bytes: new Uint8Array([0x80, 0x00]),
  },
  {
    name: "-2",
    value: -2,
    exposant: 16,
    mantisse: 0,
    bytes: new Uint8Array([0xC0, 0x00]),
  },
  {
    name: "-infinity",
    value: -Infinity,
    exposant: 31,
    mantisse: 0,
    bytes: new Uint8Array([0xFC, 0x00]),
  },
]

/**
 * IEEE 754 binary16 (half-precision) floating-point format
 */
// Deno.test("test float12 BE", () => {
//     for (const v of float16_tests) {
//     }
// })
