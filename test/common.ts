import { assertEquals as assertEqualsOrg } from "https://deno.land/std@0.173.0/testing/asserts.ts"

export function assertEqualsBuf(actual: ArrayBufferLike, expected: ArrayBufferLike, msg = "") {
  const a = new Uint8Array(actual).join(", ")
  const e = new Uint8Array(expected).join(", ")
  assertEqualsOrg(a, e, `${msg} value: "[${a}]" should be eq to "[${e}]"`)
}

export function assertEquals<T>(actual: T, expected: T, msg = "") {
  assertEqualsOrg(actual, expected, `${msg} value: "${actual}" should be eq to "${expected}"`)
}
