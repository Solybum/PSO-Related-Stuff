###FilePointer

FilePointer uses an internal pointer and some helper methods to simplify the process of reading binary files as opposed to using Nodejs' buffer class directly.

**Install**  
```
$ npm install filepointer
```  

Version 0.0.1 File pointer is a small wrapper class for reading binary data from files. It's a small side library I've been writing when working with converting binary files to ascii and json formats. It's still in its infancy and subject to changes, so I don't recomend using it for anything too important. But if you want to try it out, feel free to.  

Also the version number on npm will probably change since I need to update the version to publish changes, so please reverence the version number in this readme as a better reference.

**Import**  
```
var FilePointer = require("filepointer");

var fp = new FilePointer("some_file.bin");
```

The FilePointer function can be imported by requiring it. Instances of FilePointer can be initiated by calling the new keyword and passing a filename as an argument. FilePointer simply calls fs.readFileSync internally, so an error will be thrown if the file doesn't exist.


**fp.seek_set**
```
fp.seek_set(offset) 
```

Seeks to an offset from the start of the file.

**fp.seek_cur**
```
fp.seek_cur(offset) 
```

Seeks to an offset from the current file pointer position.

**fp.seek_end**
```
fp.seek_end(offset) 
```

Seeks to an offset from the end of end of the file.

**fp.trim**
```
fp.trim() 
```

Trims the internal buffer to the location of the current file pointer, and sets the value of the current pointer to zero. Useful when offsets inside a file do not account for the position in which the offset is declared.

**fp.slice**
```
fp.slice(start, end) 
```

Copies and returns a raw buffer object from the provided start and end values in the argument. Does not advance the internal file pointer, and does not change the internal buffer.

**fp.read_word**
```
fp.read_word(offset) 
```

This function reads the next four bytes in the file as an unsigned short. The internal file pointer advances by two bytes.

**fp.read_dword**
```
fp.read_dword(offset) 
```

This function reads the next four bytes in the file as an unsigned integer. The internal file pointer advances by four bytes.

**fp.read_single**
```
fp.read_single() 
```

This function reads the next four bytes in the file as a float. In order to read the file as a decimal in the command line, the value is truncated to six decimal places. The internal file pointer advances by four bytes.

**fp.read_hex**
```
fp.read_hex(len) 
```

Mostly used for debuging. This function performs the same function as fp.read_str, except as hex characters instead of ascii. The internal pointer advances by the value of the argument provided. Not very useful in production, but when debuging it's helpful for reading what the current data at the current pointer is.

**fp.read_str**
```
fp.read_str(len) 
```

This function reads a string as ascii characters form the current file location for the length of the value provided. The function truncates null characters from the string. The internal pointer advances by the value of the argument provided.

**fp.read_iff**
```
fp.read_iff() 
```

This function is the same thing as fp.read_str(4). It reads four bytes as a string and returns them. In order to make my code descriptive in terms of functionality, I made this a dedicated function. This function advances the internal file pointer by four bytes.

**fp.get_pos**
```
fp.get_pos() 
```

Returns the current location of the inner file pointer. Similar to the functionality of ftell in C.

**fp.find_iff**
```
fp.find(str, [seek_cur]) 
```
Searching for an [Interchange File Format](https://en.wikipedia.org/wiki/Interchange_File_Format) inside a file is a pretty common function I found myself using. This function takes a string of length four or less, and a boolean to search from the current position or not. By default it will search from the beginning of the file. If the IFF string is found inside the file, the inner file pointer is updated to the position of the start of the string. If the string is not found, the function returns false and the pointer remains where it was.

**fp.read_angle**
```
fp.read_angle() 
```

This function reads four bytes as an unsigned integer and converts it to degrees where 0x0000 corresponds to zero and 0xFFFF corresponds to 360 degrees. This function advances the internal file pointer by four bytes.

