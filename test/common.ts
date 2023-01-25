import { assertEquals as assertEqualsOrg } from "https://deno.land/std@0.173.0/testing/asserts.ts"

export function assertEqualsBuf(actual: ArrayBufferLike, expected: ArrayBufferLike, msg = '') {
    const a = new Uint8Array(actual)
    const e = new Uint8Array(expected)
    assertEqualsOrg(a, e, `${msg} value: "${a}" should be eq to "${e}"`);
}
