###Njm_Convert

Is a utility for converting Phantasy Star Online Blue Burst animations to the
Phatasy Star Online Version 2 format for compatibility with
[Noesis](http://www.richwhitehouse.com/index.php?content=inc_projects.php).

**Install**   

To install, you need to have Nodejs installed with NPM and included in your path. If you install from Nodejs.org on Windows, these settings should by applied by default on install.
```
> npm install njm_convert -g
```

**How to Use**   

This tool applies to data inside Phatasy Star Online Blue Burst's data.gsl archive
file containing the data from Episodes I&II. The character and animation data for
the enemies is then contained inside bml files inside that archive, so those need
to be extracted next.

After extracting the enemy bml files, you will end up with .nj files for the enemy
models, .xvm files for the textures and .njm files for the animations. If you try
to run the animations with Noesis, you will find that while not causing the program
to crash, it does cause the animations to twitch like demon spawn.

This is because the file structure for some animations used in Blue Burst differ
from the format that Noesis is able to recognize. You can convert them into a
compatable format with:
```
> njm_convert <filename.njm>
```

And the animation should be exported to a Noesis readable filename_n.njm

**How it works**

This is easier done that said. The .njm file type structure is actually pretty
simple. It has a header, a motion list, and the actual motion data from each
key frame. The only difference is that Blue Burst only uses two bytes for each
key frame, while PSO version 2 used two bytes with two zero bytes of spacing
inbetween.

This utility reads the data, adds spacing inbetween the key frame data and then
re-packages the file with the new re-calculated pointers for the motion list and
header.

**License**

Njm_Convert is avialable under GPLv2. If the source code helps, it would be
appretiated if you included "Adpated from Kion's PSO_Toolset source code and/or
documents" some where in your code, or version information in your program, and
a link back to this page from your project webpage.
