import { endianness } from "https://deno.land/std@0.173.0/node/os.ts"
const isNativelittleEndian = endianness() === "LE"
/**
 * stuct builder like python stuct
 * https://docs.python.org/3/library/struct.html
 */
export type Operation<T = unknown> = {
  type: string
  get: (view: DataView) => T
  set: (view: DataView, value: T) => void
  size: number
  offset: number
}

export type PackSupportedType = bigint | number | string | boolean | Deno.PointerValue
//type OpGenerator = (offset: number, littleEndian?: boolean) => Opperation<bigint> | Opperation<number> | Opperation<boolean> | Opperation<Deno.PointerValue>;

type OpGenerator<T = unknown> = ((offset: number, littleEndian?: boolean, multiplicator?: number /*, alignmentMask?: number*/) => Operation<T>) & { size: number }

const paddingChar = 0

const Op_s32: OpGenerator<string> = (offset: number, littleEndian?: boolean, multiplicator = 1 /*, alignmentMask = 0*/) => {
  return {
    type: "string",
    get: (view: DataView): string => {
      const chars: number[] = []
      for (let i = 0; i < multiplicator; i++) {
        const char = view.getUint32(offset + i * 4, littleEndian)
        if (char === 0) {
          break
        }
        chars.push(char)
      }
      return String.fromCharCode(...chars)
    },
    set: (view: DataView, value: string) => {
      const strLen = Math.min(value.length, multiplicator)
      for (let i = 0; i < strLen; i++) {
        view.setInt32(offset + 4 * i, value.charCodeAt(i), littleEndian)
      }
      for (let i = strLen; i < multiplicator; i++) {
        view.setInt32(offset + i * 4, paddingChar, littleEndian)
      }
      // no more padding for string
      // while (strLen & alignmentMask! - 0) {
      //   view.setInt32(offset + strLen * 4, paddingChar)
      //   strLen++
      // }
    },
    offset,
    size: multiplicator * 4,
  } as Operation<string>
}
Op_s32.size = 4

// Need to find python spec about s type
// : OpGenerator<string> = (offset: number, multiplicator: number)
const Op_s16: OpGenerator<string> = (offset: number, littleEndian?: boolean, multiplicator = 1 /*, alignmentMask = 0*/) => {
  return {
    type: "string",
    get: (view: DataView): string => {
      const chars: number[] = []
      for (let i = 0; i < multiplicator; i++) {
        const char = view.getUint16(offset + i * 2, littleEndian)
        if (char === 0) {
          break
        }
        chars.push(char)
      }
      return String.fromCharCode(...chars)
    },
    set: (view: DataView, value: string) => {
      const strLen = Math.min(value.length, multiplicator)
      for (let i = 0; i < strLen; i++) {
        view.setInt16(offset + i * 2, value.charCodeAt(i), littleEndian)
      }
      for (let i = strLen; i < multiplicator; i++) {
        view.setInt16(offset + i * 2, paddingChar, littleEndian)
      }
      // no more padding for string
      // while (strLen & alignmentMask! - 0) {
      //   view.setInt16(offset + strLen * 2, paddingChar)
      //   strLen++
      // }
    },
    offset,
    size: multiplicator * 2,
  } as Operation<string>
}
Op_s16.size = 2

const Op_s8: OpGenerator<string> = (offset: number, _littleEndian?: boolean, multiplicator = 1 /*, alignmentMask = 0*/) => {
  return {
    type: "string",
    get: (view: DataView): string => {
      const of = offset + view.byteOffset
      const data = view.buffer.slice(of, of + multiplicator)
      let str = String.fromCharCode(...new Uint8Array(data))
      const p = str.indexOf("\0")
      if (p >= 0) {
        str = str.slice(0, p)
      }
      return str
    },
    set: (view: DataView, value: string) => {
      const strLen = Math.min(value.length, multiplicator)
      for (let i = 0; i < strLen; i++) {
        view.setInt8(offset + i, value.charCodeAt(i))
      }
      for (let i = strLen; i < multiplicator; i++) {
        view.setInt8(offset + i, paddingChar)
      }
      // no more padding for string
      // while (strLen & alignmentMask! - 0) {
      //   view.setInt8(offset + strLen, paddingChar)
      //   strLen++
      // }
    },
    offset,
    size: multiplicator,
  } as Operation<string>
}
Op_s8.size = 1

const Op_b: OpGenerator<number> = (offset: number) => {
  return {
    type: "int8",
    get: (view: DataView) => view.getInt8(offset),
    set: (view: DataView, value: number) => {
      if (value < -128 || value > 127) {
        throw new Error(`B format requires -128 <= number <= 127, got ${value}`)
      }
      view.setInt8(offset, value)
    },
    offset,
    size: 1,
  } as Operation<number>
}
Op_b.size = 1

const Op_B: OpGenerator<number> = (offset: number) => {
  return {
    type: "uint8",
    get: (view: DataView) => view.getUint8(offset),
    set: (view: DataView, value: number) => {
      if (value < 0 || value > 255) {
        throw new Error(`B format requires 0 <= number <= 255, got ${value}`)
      }
      view.setUint8(offset, value)
    },
    offset,
    size: 1,
  } as Operation<number>
}
Op_B.size = 1

const Op_Bool: OpGenerator<boolean> = (offset: number) => {
  return {
    type: "bool8",
    get: (view: DataView) => !!view.getUint8(offset),
    set: (view: DataView, value: number | boolean) => {
      return view.setUint8(offset, value ? 1 : 0)
    },
    size: 1,
    offset,
  } as Operation<boolean>
}
Op_Bool.size = 1

const Op_h: OpGenerator<number> = (offset: number, littleEndian?: boolean) => {
  return {
    type: "short16",
    get: (view: DataView) => view.getInt16(offset, littleEndian),
    set: (view: DataView, value: number) => {
      if (value < -32768 || value > 32767) {
        throw new Error(`h format requires -32768 <= number <= 32767, got ${value}`)
      }
      return view.setInt16(offset, value, littleEndian)
    },
    size: 2,
    offset,
  } as Operation<number>
}
Op_h.size = 2

const Op_H: OpGenerator<number> = (offset: number, littleEndian?: boolean) => {
  return {
    type: "ushort16",
    get: (view: DataView) => view.getUint16(offset, littleEndian),
    set: (view: DataView, value: number) => {
      if (value < 0 || value > 65535) {
        throw new Error(`H format requires 0 <= number <= 65535, got ${value}`)
      }
      return view.setUint16(offset, value, littleEndian)
    },
    size: 2,
    offset,
  } as Operation<number>
}
Op_H.size = 2

const Op_i: OpGenerator<number> = (offset: number, littleEndian?: boolean) => {
  return {
    type: "int32",
    get: (view: DataView) => view.getInt32(offset, littleEndian),
    set: (view: DataView, value: number) => {
      if (value < -2147483648 || value > 2147483647) {
        throw new Error(`i/l format requires -2147483648 <= number <= 2147483647, got ${value}`)
      }
      return view.setInt32(offset, value, littleEndian)
    },
    size: 4,
    offset,
  } as Operation<number>
}
Op_i.size = 4

const Op_I: OpGenerator<number> = (offset: number, littleEndian?: boolean) => {
  return {
    type: "uint32",
    get: (view: DataView) => view.getUint32(offset, littleEndian),
    set: (view: DataView, value: number) => {
      if (value < 0 || value > 4294967295) {
        throw new Error(`I/L format requires 0 <= number <= 4294967295, got ${value}`)
      }
      view.setUint32(offset, value, littleEndian)
    },
    size: 4,
    offset,
  } as Operation<number>
}
Op_I.size = 4

const Op_q: OpGenerator<bigint> = (offset: number, littleEndian?: boolean) => {
  return {
    type: "int64",
    get: (view: DataView) => view.getBigInt64(offset, littleEndian),
    set: (view: DataView, value: bigint) => view.setBigInt64(offset, value, littleEndian),
    size: 8,
    offset: offset,
  } as Operation<bigint>
}
Op_q.size = 8

const Op_Q: OpGenerator<bigint> = (offset: number, littleEndian?: boolean) => {
  return {
    type: "uint64",
    get: (view: DataView) => view.getBigUint64(offset, littleEndian),
    set: (view: DataView, value: bigint) => view.setBigUint64(offset, value, littleEndian),
    size: 8,
    offset,
  } as Operation<bigint>
}
Op_Q.size = 8

const Op_f: OpGenerator<number> = (offset: number, littleEndian?: boolean) => {
  return {
    type: "float32",
    get: (view: DataView) => view.getFloat32(offset, littleEndian),
    set: (view: DataView, value: number) => view.setFloat32(offset, value, littleEndian),
    size: 4,
    offset,
  } as Operation<number>
}
Op_f.size = 4

const Op_d: OpGenerator<number> = (offset: number, littleEndian?: boolean) => {
  return {
    type: "float64",
    get: (view: DataView) => view.getFloat64(offset, littleEndian),
    set: (view: DataView, value: number) => view.setFloat64(offset, value, littleEndian),
    size: 8,
    offset,
  } as Operation<number>
}
Op_d.size = 8

const Op_p: OpGenerator<Deno.PointerValue> = (offset: number) => {
  return {
    type: "pointer",
    // hard to test, requiers ffi calls
    get: (view: DataView) => Deno.UnsafePointer.of(new DataView(view.buffer, offset + view.byteOffset)),
    set: (view: DataView, value: Deno.PointerValue) => view.setBigUint64(offset, value as bigint),
    size: 8,
    offset,
  } as Operation<Deno.PointerValue>
}
Op_p.size = 8

/**
 * This module converts between Deno values and C structs represented as ArrayBuffer objects.
 *
 * see python doc for usage https://docs.python.org/3/library/struct.html
 */
export class Struct {
  // deno-lint-ignore no-explicit-any
  readonly offsets: Operation<any>[]
  public readonly size: number

  constructor(public readonly format: string) {
    let littleEndian = isNativelittleEndian
    let alignmentMask = 0
    // deno-lint-ignore no-explicit-any
    const offsets: Operation<any>[] = []
    let size = 0
    let multiplier = ""
    let extra: null | string = null
    for (let i = 0; i < format.length; i++) {
      const next = format[i]
      // deno-lint-ignore no-explicit-any
      let nextOp: OpGenerator<any> | 'padding' | null = null
      switch (next) {
        case ".":
          extra = ""
          break
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          if (extra !== null) {
            extra += next
          } else {
            multiplier += next
          }
          break
        case "@": // native
          // alignmentMask = 7; // pad every 8 bytes
          alignmentMask = 3 // pad every 4 bytes tester on python 64 bites
          littleEndian = isNativelittleEndian
          break
        case "=": // native
          alignmentMask = 0
          littleEndian = isNativelittleEndian
          break
        case "<": // little endian
          littleEndian = true
          break
        case "!": // network (= big-endian)
        case ">": // big endian
          littleEndian = false
          break
        case "x": // padding
          nextOp = 'padding'
          break
        case "c": // char
        case "b": // signed char
          nextOp = Op_b
          break
        case "B": // unsigned char
          nextOp = Op_B
          break
        case "?": // bool
          nextOp = Op_Bool
          break
        case "h": // short
          nextOp = Op_h
          break
        case "H": // unsigned short
          nextOp = Op_H
          break
        case "i": // int
        case "l": // long
          nextOp = Op_i
          break
        case "I": // unsigned int
        case "L": // unsigned long
          nextOp = Op_I
          break
        case "q": // long long
        case "n": // ssize_t 64 bit only
          nextOp = Op_q
          break
        case "Q": // unsigned long long
        case "N": // size_t 64 bit only
          nextOp = Op_Q
          break

        //case 'e': // float 16bit not available in deno
        //    nextOp = Op_e(size, littleEndian));
        //    break;

        case "f": // float
          nextOp = Op_f
          break
        case "d": // double
          nextOp = Op_d
          break
        case "s": // char[] should be a buffer ?
          nextOp = Op_s8 // or 16 ?
          break
        case "p": // char[]
        case "P": // void*
          nextOp = Op_p
          break
        default:
          throw new Error(`Unknown Packing type ${next}`)
      }
      if (nextOp) {
        const times = Number(multiplier || "1")
        if (nextOp === "padding") {
          size += times
        } else if (next === "s") {
          if (extra === "32") {
            nextOp = Op_s32
          } else if (extra === "16") {
            nextOp = Op_s16
          } else if (extra === "8") {
            nextOp = Op_s8
          } else if (extra != null) {
            throw new Error(`Unknown Packing type .${extra}s, only .8s, .16s and .32s are supported`)
          }
          const getter = nextOp(size, littleEndian, times /*, 0*/) // alignmentMask do not pad string
          offsets.push(getter)
          size += getter.size
          // if (alignmentMask) {
          //     while ((size & alignmentMask) != 0) {
          //         // console.log('add aliognement from', size, 'check', size & alignment, 'alignment', alignment)
          //         size += 1
          //     }
          // }
        } else {
          for (let j = 0; j < times; j++) {
            // no padding for c b B x
            if (alignmentMask && next !== "c" && next !== "b" && next !== "B" && next !== "x") {
              while ((size & alignmentMask) != 0) {
                // console.log('add aliognement from', size, 'check', size & alignment, 'alignment', alignment)
                size += 1
              }
            }
            // (size, littleEndian)
            const getter = nextOp(size, littleEndian)
            offsets.push(getter)
            size += nextOp.size
          }
        }
        multiplier = ""
        extra = null
      }
    }
    this.offsets = offsets
    this.size = size
  }
  /**
   * Return a bytes object containing the values v1, v2, ??? packed according to the format string format. The arguments must match the values required by the format exactly.
   * @param values values to pack
   * @returns a bytes object containing the values v1, v2, ??? packed according to the format string format.
   */
  pack(...values: Array<PackSupportedType>): ArrayBuffer {
    const buffer = new ArrayBuffer(this.size)
    const view = new DataView(buffer)
    const max = Math.min(this.offsets.length, values.length)
    for (let i = 0; i < max; i++) {
      const op = this.offsets[i]
      op.set(view, values[i])
    }
    return buffer
  }
  /**
   * Unpack from the buffer buffer (presumably packed by pack(format, ...)) according to the format string format.
   * The result is a tuple even if it contains exactly one item. The buffer???s size in bytes must match the size required by the format, as reflected by calcsize().
   *
   * @param buffer destination buffer
   * @param offset in destination offset
   * @param values values to pack
   * @returns the inputed buffer
   */
  pack_into(buffer: ArrayBuffer, offset: number, ...values: Array<PackSupportedType>): ArrayBuffer {
    if (ArrayBuffer.isView(buffer)) {
      offset += buffer.byteOffset
      buffer = buffer.buffer
    }
    const view = new DataView(buffer, offset)
    const max = Math.min(this.offsets.length, values.length)
    for (let i = 0; i < max; i++) {
      this.offsets[i].set(view, values[i])
    }
    return buffer
  }
  /**
   * camelCase alias for pack_into
   */
  packInto = this.pack_into;

  /**
   * Unpack from buffer starting at position offset, according to the format string format.
   * The result is a tuple even if it contains exactly one item. The buffer???s size in bytes,
   * starting at position offset, must be at least the size required by the format,
   * as reflected by calcsize().
   */
  unpack_from(buffer: ArrayBuffer, offset = 0): Array<PackSupportedType> {
    if (ArrayBuffer.isView(buffer)) {
      offset += buffer.byteOffset
      buffer = buffer.buffer
    }
    const view = new DataView(buffer, offset)
    const values = []
    for (const op of this.offsets) {
      values.push(op.get(view))
    }
    return values
  }

  /**
   * camelCase alias for unpack_from
   */
  unpackFrom = this.unpack_from;

  /**
   * Iteratively unpack from the buffer buffer according to the format string format.
   * This function returns an iterator which will read equally sized chunks from the buffer until all its contents have been consumed.
   * The buffer???s size in bytes must be a multiple of the size required by the format, as reflected by calcsize().
   * Each iteration yields a tuple as specified by the format string.
   */
  *iter_unpack(buffer: ArrayBuffer, offset = 0): Generator<PackSupportedType, void, void> {
    if (ArrayBuffer.isView(buffer)) {
      offset += buffer.byteOffset
      buffer = buffer.buffer
    }
    const view = new DataView(buffer, offset)
    const max = this.offsets.length
    for (let i = 0; i < max; i++) {
      yield this.offsets[i].get(view)
    }
  }

  /**
   * camelCase alias for iter_unpack
   */
  iterUnpack = this.iter_unpack;
}

/**
 * Return a bytes object containing the values v1, v2, ??? packed according to the format string format. The arguments must match the values required by the format exactly.
 */
export function pack(format: string, ...values: Array<PackSupportedType>): ArrayBuffer {
  return new Struct(format).pack(...values)
}

/**
 * Pack the values v1, v2, ??? according to the format string format and write the packed bytes into the writable buffer buffer starting at position offset. Note that offset is a required argument.
 */
export function pack_into(format: string, buffer: ArrayBuffer, offset: number, ...values: Array<PackSupportedType>): ArrayBuffer {
  return new Struct(format).pack_into(buffer, offset, ...values)
}

/**
 * Unpack from the buffer buffer (presumably packed by pack(format, ...)) according to the format string format. The result is a tuple even if it contains exactly one item. The buffer???s size in bytes must match the size required by the format, as reflected by calcsize().
 */
export function unpack(format: string, buffer: ArrayBuffer): Array<PackSupportedType> {
  return new Struct(format).unpack_from(buffer)
}

/**
 * Unpack from buffer starting at position offset, according to the format string format. The result is a tuple even if it contains exactly one item. The buffer???s size in bytes, starting at position offset, must be at least the size required by the format, as reflected by calcsize().
 */
export function unpack_from(format: string, buffer: ArrayBuffer, offset = 0): Array<PackSupportedType> {
  return new Struct(format).unpack_from(buffer, offset)
}

/**
 * Iteratively unpack from the buffer buffer according to the format string format. This function returns an iterator which will read equally sized chunks from the buffer until all its contents have been consumed. The buffer???s size in bytes must be a multiple of the size required by the format, as reflected by calcsize().
 * Each iteration yields a tuple as specified by the format string.
 */
export function iter_unpack(format: string, buffer: ArrayBuffer): Generator<PackSupportedType, void, void> {
  return new Struct(format).iter_unpack(buffer)
}

/**
 * Return the size of the struct (and hence of the bytes object produced by pack(format, ...)) corresponding to the format string format.
 */
export function calcsize(format: string): number {
  return new Struct(format).size
}
