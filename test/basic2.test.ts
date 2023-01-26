import { calcsize, iter_unpack, pack, pack_into, unpack_from } from "../struct.ts"
import { assertEquals, assertEqualsBuf } from "./common.ts"

Deno.test("CalcSize", () => {
  assertEquals(calcsize("2i"), 8, "CalcSize 2i")
  assertEquals(calcsize("2Q"), 16, "CalcSize 2Q")
  assertEquals(calcsize("@cQ"), 12, "CalcSize @cQ")
  assertEquals(calcsize("@Qc"), 9, "CalcSize @Qc")
})

Deno.test("unpack_from", () => {
  const offseted = new Uint8Array([255, 255, 1, 0, 0, 0]);

  const [i0] = unpack_from("i", new Uint8Array([1, 0, 0, 0]));
  assertEquals(i0, 1, "unpack_from")

  const [i1] = unpack_from("i", new Uint8Array([1, 0, 0, 0]).buffer);
  assertEquals(i1, 1, "unpack_from")

  const [i2] = unpack_from("i", offseted.buffer, 2);
  assertEquals(i2, 1, "unpack_from offset 2")

  const [i3] = unpack_from("i", offseted.slice(2, 6));
  assertEquals(i3, 1, "unpack_from offset 2")
})

Deno.test("iter_unpack", () => {
  const data = new Uint8Array(['a'.charCodeAt(0), 'b'.charCodeAt(0), 'c'.charCodeAt(0)]);
  const iter = iter_unpack("3c", data);
  let p = 0;
  for (const c of iter) {
    assertEquals(c, 'abc'.charCodeAt(p++));
  }
  assertEquals(p, 3, 'iter 3 times');
})

Deno.test("pack_into", () => {
  const buf = pack_into('cc', new Uint8Array(2), 0, 'a'.charCodeAt(0), 'b'.charCodeAt(0));
  assertEqualsBuf(buf, new Uint8Array(['a'.charCodeAt(0), 'b'.charCodeAt(0)]), "pack_into")
  const buf2 = pack_into('cc', new Uint8Array(2).buffer, 0, 'a'.charCodeAt(0), 'b'.charCodeAt(0));
  assertEqualsBuf(buf2, new Uint8Array(['a'.charCodeAt(0), 'b'.charCodeAt(0)]), "pack_into")
})

Deno.test("pack", () => {
  const buf = pack('cc', 'a'.charCodeAt(0), 'b'.charCodeAt(0));
  assertEqualsBuf(buf, new Uint8Array(['a'.charCodeAt(0), 'b'.charCodeAt(0)]), "pack_into")
})
