/**
 * # Deno lang port of Python's struct module
 *
 * This module performs conversions between Deno values and C structs represented as ArrayBuffer. This can be used in handling binary data stored in files, from frno FFI or from network connections, among other sources. It uses Format Strings as compact descriptions of the layout of the C structs and the intended conversion to/from Deno values.
 *
 * ## Byte Order, Size, and Alignment
 *
 * The first two format characters of the format string are used to determine the byte order, size, and alignment of the C struct. The following format characters are defined:
 *
 * | Format | Byte Order    | Size     | Alignment |
 * |--------|---------------|----------|-----------|
 * |   @    | native        | native   | native    |
 * |   =    | native        | standard | none      |
 * |   <    | little-endian | standard | none      |
 * |   >    | big-endian    | standard | none      |
 * |   !    | network (= big-endian) | standard | none |
 *
 * ## Format Strings
 *
 * Format strings are used to describe the layout of data in C structs and the order in which values are converted to and from binary data. The following format characters are defined:
 *
 * | Format |   C Type   | Deno Type | Standard Size | Notes |
 * |--------|------------|-------------|---------------|-------|
 * | x | pad byte        | no value          |   |     |
 * | c | char            | number            | 1 |     |
 * | b | signed char     | number            | 1 | (1) |
 * | B | unsigned char   | number            | 1 |     |
 * | ? | _Bool           | boolean           | 1 | (1) |
 * | h | short           | number            | 2 |     |
 * | H | unsigned short  | number            | 2 |     |
 * | i | int             | number            | 4 |     |
 * | I | unsigned number | number            | 4 |     |
 * | l | long            | number            | 4 |     |
 * | L | unsigned long   | number            | 4 |     |
 * | q | long long       | bigint            | 8 |     |
 * | Q | unsigned long long | bigint         | 8 |     |
 * | n | ssize_t         | number            | 8 | (2) |
 * | N | size_t          | number            | 8 | (2) |
 * | f | float           | number            | 4 |     |
 * | d | double          | number            | 8 |     |
 * | s | char[]          | string            |   |     |
 * | p | char[]          | Deno.PointerValue | 8 |     |
 * | P | void *          | Deno.PointerValue | 8 | (3) |
 *
 * (1) The standard size is the size of the C type when used for argument passing; it may be larger than the size of the type when used as a data type.
 *
 * (2) The 'n' and 'N' types are the same as the 'l' and 'L' types, except that they are signed and unsigned, respectively.
 *
 * (3) The 'P' type is not impacted by Endian.
 *
 * The following format characters are defined for arrays of values:
 *
 * > the *e* format is missing fot now, so it is not possible to use arrays of half-precision floats
 *
 * ## pystruct special features
 *
 * string type ('s') can be used with a number to specify the length of the string. For example, '10s' means a string of length 10.
 * If the string is shorter than the specified length, it is padded with null bytes. If the string is longer, it is truncated.
 * The length is not included in the packed data.
 * the string type can be used with a .8, .16 .32 to specify bite per character. For example, '10.8s' means a string of length 10, with 8 bits per character.
 *
 * @module pystruct
 */
export { Struct } from "./struct.ts"
export { calcsize, iter_unpack, pack, pack_into, unpack, unpack_from } from "./struct.ts"
