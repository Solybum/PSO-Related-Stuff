###PVM_Export

Is a utility for exporting all of the PVR files inside of a PVM archive to .png
images.

**Install**   
To install, you need to have Nodejs installed with NPM and included in your path.
If you install from [Nodejs.org](http:://nodejs.org) on Windows, these settings
are default.
```
> npm install pvm_export -g
```

**How to Use**   

After installing the command "pvm_export" will available from the system path.
Meaning that from any folder in Windows you can hold shift while right clicking
and select "Open Command line here" from the context menu. From there you can
run the utility on a pvm file with the command below.

```
> pvm_export <filename.pvm>
```

The utility will make a folder with the base filename of the original pvm file
in the same directory as the input file. All of the image files inside the pvm
archive will be extracted, an converted to png before being written into the
folder the utility creates.

**License**   

PVM_Export is avialable under GPLv2. If the source code helps, it would be
appretiated if you included "Adpated from Kion's PSO_Toolset source code and/or
documents" some where in your code, or version information in your program, and
a link back to this page from your project webpage.
