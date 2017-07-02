###GSL_Export

Is a utility for exporting all files in a GSL archive to a folder with the base
name of the archive.

**Install**  

To install, you need to have Nodejs installed with NPM and included in your path. If you install from Nodejs.org on Windows, these settings should by applied by default on install.
```
> npm install gsl_export -g
```

**How to Use**

After installing the command "gsl_export" will available from the system path.
Meaning that from any folder in Windows you can hold shift while right clicking
and select "Open Command line here" from the context menu. From there you can
run the utility on a bml file with the command below.

```
> gsl_export <filename.gsl>
```

The utility will make a folder with the base filename of the original gsl file
in the same directory as the input file. All of the files inside the gsl files
are extracted into the folder the utility creates.

**Special Thanks**  

Another special thanks to BlueCrab for documenting this file type and is included in
this folder as "GSL_Format.txt". BlueCrab is the author of [Sylverant](https://sf.net/p/sylverant) 
a Linux based open-source PSO server.

**License**

BML_Export is avialable under GPLv2. If the source code helps, it would be
appretiated if you included "Adpated from Kion's PSO_Toolset source code and/or
documents" some where in your code, or version information in your program, and
a link back to this page from your project webpage.
