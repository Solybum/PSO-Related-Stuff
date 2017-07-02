
Ninja-lib is now on npm. You can now convert files easily using Nodejs. This
library has been made mostly with BlueBurst in mind and have no intention of
supporting other versions, but this is an open source library, so if you need
you change anything you can always fork the github repository.

**Installation**

Install ninja-lib with npm
```
npm install ninja-lib
```

Use it in your code
```
var ninja = require("ninja-lib");
```

**get_extension(buffer)**

This function takes a buffer as an agrument, looks at the first four bytes and
returns an extension for the file based on the Interchange File Format given by
the first four bytes of the file. Returns ".bin" if file extension is not
recognized.
```
var buffer = fs.readFileSync("unkown_file.bin");
var ext = ninja.get_extension(buffer);
//returns ".xvm", ".nj", etc
```

**extract_bml(filename, [dest_folder])**

This function takes a filename and an destination folder as an optional argument.
The provided bml file is parsed and extracted to the destination folder. If no
destination folder is provided, the files are written to the same directory as
the source filename. This function will throw an error if the source file or
destinatation folder provided do not exist.

Returns a list of all of the extracted files from the bml archive.
```
var bml_file = "booma_bagons.bml";
var arr = ninja.extract_bml(bml_file, "out/");
//returns ["out/booma.nj", "out/booma.pvm", ...]
```

**extract_afs(filename, [compressed], [dest_folder])**

This function takes a filename, compressed boolean and destination folder as
arguments. Compressed is a boolean value stating if the files inside the afs
file are compressed with prs. Dest folder follows the same rules as extract_bml,
if no folder is provided, files are extracted to the same directory as the source
folder.

Returns a list of all of the extracted files from the afs archive.
```
var afs_file = "WeaponList.afs";
var arr = ninja.extract_afs(afs_file, true, "out/");
//returns ["out/WeaponList_000.xvm", "out/WeaponList_001.xvm" ...]
```

**extract_gsl(filename, [dest_folder])**

This function takes a filename and a destination folder as arguments. Dest folder
follows the same rules as extract_bml, if no folder is provided, files are
extracted to the same directory as the source folder.

Returns a list of all of the extracted files from the gsl archive.
```
var gsl_file = "data.gsl";
var arr = ninja.extract_gsl(gsl_file, "out/");
//returns ["out/lightentry.bin", "out/map_ancient_e.bin" ...]
```

**decompress_prs(buffer)**

This function takes a buffer as an argument and returns a decompressed buffer
as a result.
```
var prs_buffer = fs.readFileSync("some_file.prs");
var decomp_buffer = ninja.decompress_prs(prs_buffer);
var ext = ninja.get_extension(decomp_buffer);
fs.writeFileSync("some_file" + ext, decomp_buffer);
```
