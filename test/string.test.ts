import { assertThrows } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { pack, unpack } from "../mod.ts"
import { Struct } from "../struct.ts"
import { assertEquals, assertEqualsBuf } from "./common.ts"

Deno.test("Python / Demonstrate the difference between 's' and 'c' format characters:", () => {
  // pack("@ccc", b'1', b'2', b'3')
  const buf = pack("@ccc", "1".charCodeAt(0), "2".charCodeAt(0), "3".charCodeAt(0))
  const exp = new Uint8Array([1, 2, 3])
  assertEquals(buf, exp.buffer, "@ccc encoding as \\1\\2\\3")
  const packed = pack("@3s", "123")
  const back = String.fromCharCode(...new Uint8Array(packed))
  assertEquals(back, `123`) // padded to 4 Bytes
  const [unpacked] = unpack("@3.8s", packed)
  assertEquals(unpacked, "123", "[ack / unpack strung should drop padding \\0")
})

Deno.test("string invalid bit throw", () => {
  assertThrows(() => pack("3.9s", "123", 1), "text 3/3 9bit should throw")
})

Deno.test("string default bit too large", () => {
  const expected = new Uint8Array([49, 50, 51])
  assertEqualsBuf(pack("3s", "123"), expected, "text 3/3 8bit")
  assertEqualsBuf(pack("3s", "1234"), expected, "text 4/3 should truncate 8bit")
})

Deno.test("string 8bit too large", () => {
  const expected = new Uint8Array([49, 50, 51])
  assertEqualsBuf(pack("3.8s", "123"), expected, "text 3/3 8bit")
  assertEqualsBuf(pack("3.8s", "1234"), expected, "text 4/3 should truncate 8bit")
  assertEquals(unpack("3.8s", expected), ["123"], "text 3/3 8bit unpack")
})

Deno.test("string 16bit too large LE", () => {
  const expected = new Uint8Array([49, 0, 50, 0, 51, 0])
  assertEqualsBuf(pack("<3.16s", "123"), expected, "text 3/3 16bit LE")
  assertEqualsBuf(pack("<3.16s", "1234"), expected, "text 4/3 should truncate 16bit LE")
  assertEquals(unpack("<3.16s", expected), ["123"], "text 3/3 16bit LE unpack")
})

Deno.test("string 16bit too large BE", () => {
  const expected = new Uint8Array([0, 49, 0, 50, 0, 51])
  assertEqualsBuf(pack(">3.16s", "123"), expected, "text 3/3 16bit BE")
  assertEqualsBuf(pack(">3.16s", "1234"), expected, "text 4/3 should truncate 16bit BE")
  assertEquals(unpack(">3.16s", expected), ["123"], "text 3/3 16bit BE unpack") // Failed
})

Deno.test("string 32bit too large LE", () => {
  const expected = new Uint8Array([49, 0, 0, 0, 50, 0, 0, 0, 51, 0, 0, 0])
  assertEqualsBuf(pack("<3.32s", "123"), expected, "text 3/3 16bit 32")
  assertEqualsBuf(pack("<3.32s", "1234"), expected, "text 4/3 should truncate 32bit LE")
  assertEquals(unpack("<3.32s", expected), ["123"], "text 3/3 32bit LE unpack")
})

Deno.test("string 32bit too large BE", () => {
  const expected = new Uint8Array([0, 0, 0, 49, 0, 0, 0, 50, 0, 0, 0, 51])
  assertEqualsBuf(pack(">3.32s", "123"), expected, "text 3/3 32bit BE")
  assertEqualsBuf(pack(">3.32s", "1234"), expected, "text 4/3 should truncate 32bit BE")
  assertEquals(unpack(">3.32s", expected), ["123"], "text 3/3 32bit BE unpack") // failed
})

Deno.test("pad 123 by adding int after it", () => {
  const expected = new Uint8Array([49, 50, 51, 0, 1, 0, 0, 0]);
  assertEqualsBuf(pack("@3si", "123", 1), expected, "text should get padded to 4 bytes")
})

Deno.test("16 bit string", () => {
  const expected = new Uint8Array([49, 0, 50, 0, 51, 0])
  assertEqualsBuf(pack("@3.16s", "123"), expected, "text should get 16 bit / char")
})

Deno.test("8 bit string Drop padding", () => {
  const struct = new Struct('<10.8s');
  assertEquals(struct.size, 10, "scruct size")
  const buffer = struct.pack("123");
  assertEquals(buffer.byteLength, 10, "buffer contains padding")
  const [txt] = struct.unpack_from(buffer);
  assertEquals(txt, '123', "padding are gone")
})

Deno.test("16 bit string Drop padding LE", () => {
  const struct = new Struct('<10.16s');
  assertEquals(struct.size, 20, "scruct size")
  const buffer = struct.pack("123");
  assertEquals(buffer.byteLength, 20, "buffer contains padding")
  const [txt] = struct.unpack_from(buffer);
  assertEquals(txt, '123', "padding are gone")
})

Deno.test("32 bit string Drop padding LE", () => {
  const struct = new Struct('<10.32s');
  assertEquals(struct.size, 40, "scruct size")
  const buffer = struct.pack("123");
  assertEquals(buffer.byteLength, 40, "buffer contains padding")
  const [txt] = struct.unpack_from(buffer);
  assertEquals(txt, '123', "padding are gone")
})

Deno.test("16 bit string LE", () => {
  const expected = new Uint8Array([49, 0, 50, 0, 51, 0])
  assertEqualsBuf(pack("<3.16s", "123"), expected, "text should get 16 bit / char")
})

Deno.test("16 bit string BE", () => {
  const expected = new Uint8Array([0, 49, 0, 50, 0, 51])
  assertEqualsBuf(pack(">3.16s", "123"), expected, "text should get 16 bit / char")
})

Deno.test("16 bit string LE EMOJI", () => {
  const expected =  new Uint8Array([49, 0, 61, 216, 37, 221, 51, 0])
  assertEqualsBuf(pack("<4.16s", "1🔥3"), expected, "text should get 16 bit / char")
})

Deno.test("16 bit string BE EMOJI", () => {
  const expected = new Uint8Array([0, 49, 216, 61, 221, 37, 0, 51])
  assertEqualsBuf(pack(">4.16s", "1🔥3"), expected, "text should get 16 bit / char")
})

Deno.test("32 bit string LE", () => {
  const expected = new Uint8Array([49, 0, 0, 0, 50, 0, 0, 0, 51, 0, 0, 0])
  assertEqualsBuf(pack("<3.32s", "123"), expected, "text should get 16 bit / char")
})

Deno.test("32 bit string BE", () => {
  const expected = new Uint8Array([0, 0, 0, 49, 0, 0, 0, 50, 0, 0, 0, 51])
  assertEqualsBuf(pack(">3.32s", "123"), expected, "text should get 16 bit / char")
})

Deno.test("32 bit string LE Emoji", () => {
  const expected = new Uint8Array([49, 0, 0, 0, 61, 216, 0, 0, 37, 221, 0, 0, 51, 0, 0, 0])
  assertEqualsBuf(pack("<4.32s", "1🔥3"), expected, "text should get 16 bit / char")
})

Deno.test("32 bit string BE Emoji", () => {
  const expected = new Uint8Array([0, 0, 0, 49, 0, 0, 216, 61, 0, 0, 221, 37, 0, 0, 0, 51])
  assertEqualsBuf(pack(">4.32s", "1🔥3"), expected, "text should get 16 bit / char")
})

Deno.test("non aligned test:", () => {
  const buf = pack("=ccc", "1".charCodeAt(0), "2".charCodeAt(0), "3".charCodeAt(0))
  const exp = new Uint8Array([1, 2, 3])
  assertEquals(buf, exp.buffer)
  const packed = pack("=3s", "123")
  const back = String.fromCharCode(...new Uint8Array(packed))
  assertEquals(back, "123")
})

// TODO
// Unpacked fields can be named by assigning them to variables or by wrapping the result in a named tuple:record = b'raymond   \x32\x12\x08\x01\x08'
// name, serialnum, school, gradelevel = unpack('<10sHHb', record)
//
// from collections import namedtuple
// Student = namedtuple('Student', 'name serialnum school gradelevel')
// Student._make(unpack('<10sHHb', record))
// Student(name=b'raymond   ', serialnum=4658, school=264, gradelevel=8)
