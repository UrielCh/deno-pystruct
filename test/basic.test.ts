import { Struct } from "../mod.ts"
import { assertEquals } from "./common.ts"

Deno.test("Simple bigEndian struct", () => {
  const struct1 = new Struct(">iii")
  const buffer = struct1.pack(1, 2, 3)
  const view = new DataView(buffer)
  assertEquals(view.getInt32(0), 1, "view.getInt32(0)")
  assertEquals(view.getInt32(4), 2, "view.getInt32(4)")
  assertEquals(view.getInt32(8), 3, "view.getInt32(8)")
})

Deno.test("Simple littleEndian struct", () => {
  const struct1 = new Struct("<iii")
  const buffer = struct1.pack(1, 2, 3)
  const view = new DataView(buffer)
  const littleEndian = true
  assertEquals(view.getInt32(0, littleEndian), 1, "view.getInt32(0)")
  assertEquals(view.getInt32(4, littleEndian), 2, "view.getInt32(4)")
  assertEquals(view.getInt32(8, littleEndian), 3, "view.getInt32(8)")
})

Deno.test("Simple littleEndian struct", () => {
  const struct1 = new Struct("!iii")
  const buffer = struct1.pack(1, 2, 3)
  const view = new DataView(buffer)
  const littleEndian = false
  assertEquals(view.getInt32(0, littleEndian), 1, "view.getInt32(0)")
  assertEquals(view.getInt32(4, littleEndian), 2, "view.getInt32(4)")
  assertEquals(view.getInt32(8, littleEndian), 3, "view.getInt32(8)")
})

Deno.test("Simple bigEndian struct multiplier", () => {
  const struct1 = new Struct(">3i")
  const buffer = struct1.pack(1, 2, 3)
  const view = new DataView(buffer)
  assertEquals(view.getInt32(0), 1, "view.getInt32(0)")
  assertEquals(view.getInt32(4), 2, "view.getInt32(4)")
  assertEquals(view.getInt32(8), 3, "view.getInt32(8)")
})

Deno.test("Pack pack_into with offset and multiplier", () => {
  const struct1 = new Struct(">3i")
  const buffer = new ArrayBuffer(16)
  struct1.pack_into(buffer, 4, 1, 2, 3)
  const view = new DataView(buffer)
  // assertEquals(view.getInt32(0), 0, "view.getInt32(0) should be 0")
  assertEquals(view.getInt32(4), 1, "view.getInt32(4)")
  assertEquals(view.getInt32(8), 2, "view.getInt32(8)")
  assertEquals(view.getInt32(12), 3, "view.getInt32(12)")
})

Deno.test("littleEndian all types pack", () => {
  // all aligne on 8bytes with padding
  //                          ptr,   byte,  short,   int,    long,  2long, float, double
  //                           1     2       3       4       5       6     7       8
  const struct1 = new Struct("<p" + "b7x" + "h6x" + "i4x" + "l4x" + "q" + "f4x" + "d")
  const buffer = struct1.pack(1n, 2, 3, 4, 5, 6n, 7, 8)
  const view = new DataView(buffer)
  const littleEndian = true
  // Ptr are always OS native orderd
  assertEquals(view.getBigInt64(0, false), 1n, `view.getBigInt64(0, littleEndian:${littleEndian})`)
  assertEquals(view.getInt8(8), 2, "view.getInt32(8)")
  assertEquals(view.getInt16(16, littleEndian), 3, "view.getInt16(16)")
  assertEquals(view.getInt32(24, littleEndian), 4, "view.getInt32(24)")
  assertEquals(view.getInt32(32, littleEndian), 5, "view.getInt32(32)")
  assertEquals(view.getBigInt64(40, littleEndian), 6n, "view.getBigInt64(40)")
  assertEquals(view.getFloat32(48, littleEndian), 7, "view.getFloat32(48)")
  assertEquals(view.getFloat64(56, littleEndian), 8, "view.getFloat64(56)")
})

Deno.test("littleEndian all unsigne types pack", () => {
  // all aligne on 8bytes with padding
  //                            byte,  short,   int,   long,  2long,
  //                            1      2        3      4       5
  const struct1 = new Struct("<B7x" + "H6x" + "I4x" + "L4x" + "Q")
  const buffer = struct1.pack(1, 2, 3, 4, 5n, 6)
  const view = new DataView(buffer)
  const littleEndian = true
  // Ptr are always OS native orderd
  assertEquals(view.getUint8(0), 1, "view.getUint8(0)")
  assertEquals(view.getUint16(8, littleEndian), 2, "view.getUint16(8)")
  assertEquals(view.getUint32(16, littleEndian), 3, "view.getUint32(16)")
  assertEquals(view.getUint32(24, littleEndian), 4, "view.getUint32(24)")
})

Deno.test("littleEndian all types unpack", () => {
  // all aligne on 8bytes with padding
  //                          ptr,   byte,  short,   int,    long,  longlong, float, double
  //                           1     2       3       4       5       6       7       8
  const struct1 = new Struct("<" + "b7x" + "h6x" + "i4x" + "l4x" + "q" + "f4x" + "d")
  const data = new Uint8Array([2, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 224, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 64]);
  const unpacked = struct1.unpack_from(data)
  assertEquals(unpacked, [2, 3, 4, 5, 6n, 7, 8], "unpacked 12345678");
})

Deno.test("littleEndian all unsigned types unpack", () => {
  // all aligne on 8bytes with padding
  //                           byte,  short,   int,    long,  2long
  //                           1       2       3       4       5   
  const struct1 = new Struct("<B7x" + "H6x" + "I4x" + "L4x" + "Q")
  const data = new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const unpacked = struct1.unpack_from(data)
  assertEquals(unpacked, [1, 2, 3, 4, 5n], "unpacked unsigned 12345");
})
