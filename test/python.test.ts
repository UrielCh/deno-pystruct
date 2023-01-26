import { assertThrows } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { pack, unpack } from "../mod.ts"
import { assertEquals, assertEqualsBuf } from "./common.ts"

Deno.test("Python Examples pack / unpack >bhl", () => {
  const seq = [1, 2, 3]
  const buf = pack(">bhl", ...seq)
  const valuesBack = unpack(">bhl", buf)
  assertEquals(valuesBack, seq, "unpack('>bhl', ar)")
})

Deno.test("Python Examples unpack \\x01\\x00\\x02\\x00\\x00\\x00\\x03", () => {
  const seq = [1, 2, 3]
  const ar: ArrayBuffer = new TextEncoder().encode("\x01\x00\x02\x00\x00\x00\x03").buffer
  const values = unpack(">bhl", ar)
  assertEquals(values, seq, "unpack('>bhl', ar)")
})

const padding = 0

Deno.test("test String", () => {
  assertEqualsBuf(pack("7.8s", "test"), new Uint8Array([116, 101, 115, 116, padding, padding, padding]).buffer, "pack test as 8 bit string")
  assertEqualsBuf(pack("6.16s", "test"), new Uint8Array([116, 0, 101, 0, 115, 0, 116, 0, padding, 0, padding, 0]).buffer, "pack test as 16 bit string")
  assertEqualsBuf(pack("5.32s", "test"), new Uint8Array([116, 0, 0, 0, 101, 0, 0, 0, 115, 0, 0, 0, 116, 0, 0, 0, padding, 0, 0, 0]).buffer, "pack test as 32 bit string")
})

Deno.test('Python Examples pack(">h", 99999)', () => {
  assertThrows(() => {
    pack(">h", 99999)
  }, "pack('>h', 99999) should throw")
})

// TODO
// Unpacked fields can be named by assigning them to variables or by wrapping the result in a named tuple:record = b'raymond   \x32\x12\x08\x01\x08'
// name, serialnum, school, gradelevel = unpack('<10sHHb', record)
//
// from collections import namedtuple
// Student = namedtuple('Student', 'name serialnum school gradelevel')
// Student._make(unpack('<10sHHb', record))
// Student(name=b'raymond   ', serialnum=4658, school=264, gradelevel=8)

Deno.test("test aligne should matcvh python", () => {
  assertEqualsBuf(pack("@ci", "#".charCodeAt(0), 0x12131415), new Uint8Array([35, 0, 0, 0, 21, 20, 19, 18]).buffer, "pack test as 8 bit string")
  // b'#\x00\x00\x00\x15\x14\x13\x12'

  // pack('@ic', 0x12131415, b'#')
  // assertEqualsBuf(pack('@ic', 0x12131415, '#'.charCodeAt(0)), new Uint8Array([21, 20, 19, 18, 35]).buffer, "pack test as 8 bit string")
  // b'\x15\x14\x13\x12#'
  // calcsize('@ci')
  // 8
  // calcsize('@ic')
  // 5
})
