###AFS_Export

Is a utility for exporting all files in a AFS archive to a folder with the base
name of the archive.

**Install**  

To install, you need to have Nodejs installed with NPM and included in your path.
If you install from [Nodejs.org](http:://nodejs.org) on Windows, these settings
should by applied by default on install.
```
> npm install afs_export -g
```

**How to Use**  

After installing the command "afs_export" will available from the system path.
Meaning that from any folder in Windows you can hold shift while right clicking
and select "Open Command line here" from the context menu. From there you can
run the utility on a bml file with the command below.

```
> afs_export <filename.afs>
```

The utility will make a folder with the base filename of the original afs file
in the same directory as the input file. All of the files inside the afs files
are extracted into the folder the utility creates.

All of the files inside the archive are decompressed before being written. Note
that the files inside will likely need other tools to convert them into usable
formats.

**Special Thanks**  

Special thanks to [Micky](http://forums.qhimm.com/index.php?topic=11225.0) for making
his PRS decryption method available, porting that to Nodejs was what allowed me to
make a single tool for reading, and exporting, and decompressing files from a BML
archive.

Another special thanks to BlueCrab for documenting this file type and is included in
this folder as "AFS_Format.txt". BlueCrab is the author of [Sylverant](https://sf.net/p/sylverant) 
a Linux based open-source PSO server.

**License**   

AFS_Export is avialable under GPLv2. If the source code helps, it would be
appretiated if you included "Adpated from Kion's PSO_Toolset source code and/or
documents" some where in your code, or version information in your program, and
a link back to this page from your project webpage.
