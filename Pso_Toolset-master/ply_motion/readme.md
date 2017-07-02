###Ply_Motion

Is a utility for exporting the player motion files from Phantasy Star Online
into individual .njm files.

**Install**  

To install, you need to have Nodejs installed with NPM and included in your path. If you install from Nodejs.org on Windows, these settings should by applied by default on install.
```
> npm install plymotion -g
```

**How to Use**  

To use this tool, you're first going to need Tofuman's PRC_Tool or another tool
that is able to decompress PRC archived files. Find the file PlyMotionData.pr2
in the Phantasy Star Online Version 2 game data. Decompress the data with:
```
> PRCTool.exe /D PlyMotionData.pr2 motion_data.bin
```

Then once you have the extracted motion_data.bin, you can execute this utility with
```
> ply_motion motion_data.bin
```
The utility with create an "output" folder in the current directory and write all
of the .njm files contained in the container file into that folder. The animations
can then be viewed with [Noesis](http://www.richwhitehouse.com/index.php?content=inc_projects.php)
and applied one of the .nj character models from the game.

**How it works**

How it works is actually easier done than said. The .njm file type has a pretty
simple structure with a header, a list of motion data, and then the actual motion
data with key frames. Nothing in the file needs to be changed for it to work, this
utility simply looks for each header, breaks them into a separate file, and
re-calculates the pointers before adding and NMDM interchange file format header on
the front.

**License**

Ply_Motion is avialable under GPLv2. If the source code helps, it would be
appretiated if you included "Adpated from Kion's PSO_Toolset source code and/or
documents" some where in your code, or version information in your program, and
a link back to this page from your project webpage.
