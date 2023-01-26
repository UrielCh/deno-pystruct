# deno-pystruct
An isomorphic implementation of Python struct for Deno, It had been written in the first place to map Deno FFI struct.

## content

The module contains a Stuct class for Object-oriented usage.

And they non-object-oriented variant:

> `pack(format, v1, v2, ...)`
Return a bytes object containing the values v1, v2, … packed according to the format string format. The arguments must match the values required by the format exactly.

> `pack_into(format, buffer, offset, v1, v2, ...)`
Pack the values v1, v2, … according to the format string format and write the packed bytes into the writable buffer buffer starting at position offset. Note that offset is a required argument.

> `unpack(format, buffer)`
Unpack from the buffer buffer (presumably packed by pack(format, ...)) according to the format string format. The result is a tuple even if it contains exactly one item. The buffer’s size in bytes must match the size required by the format, as reflected by calcsize().

> `unpack_from(format, /, buffer, offset=0)`
Unpack from buffer starting at position offset, according to the format string format. The result is a tuple even if it contains exactly one item. The buffer’s size in bytes, starting at position offset, must be at least the size required by the format, as reflected by calcsize().

> `iter_unpack(format, buffer)`
Iteratively unpack from the buffer buffer according to the format string format. This function returns an iterator which will read equally sized chunks from the buffer until all its contents have been consumed. The buffer’s size in bytes must be a multiple of the size required by the format, as reflected by calcsize().

> `calcsize(format)`
Return the size of the struct (and hence of the bytes object produced by pack(format, ...)) corresponding to the format string format.


Feel free to use the original doc from [python website](https://docs.python.org/3/library/struct.html)


## diffrence from the original python struct:

- pystruct does not support `e` format (16 floating point)
- pystruct add some extend `s` (string) format, 10.8s will format a string as 10 chars of 8 bit each (**default**), 10.16s will format a string as 10 chars of 16 bit each, 10.32s will format a string as 10 chars of 32 bit each.