###Rel_Export

Is a utility for exporting stage files from PSO version 2 into .obj model files. 

**Install**  

Not complete, so this script has not been published to npm yet.

**How to Use**

Each map has two files containing models. map_n.rel files and map_d.rel files. 
Both share the same file structure and can be exported by this script. The
n.rel models seem to contain models and decorations for the stage such as
leaves and lights which are visible, but the player does not interact with.
map_d.rel files contain objects such as walls or floors which the player 
does interact with.

Both of which are exportable with stage.js.

**Special Thanks**  

Special thanks to Kryslin's ExMLD.net application which he has published online. 
It's because of his published matrix functions that I was finaly able to render
.nj models correctly, and apply them to the map models. Another thanks goes out
to Schthack who posted his code for the map viewer. And while it doesn't apply to
Pso Version 2 specifically, it was a key hint for learning how to trace through
map files.

**License**

Rel_Export is avialable under GPLv2. If the source code helps, it would be
appretiated if you included "Adpated from Kion's PSO_Toolset source code and/or
documents" some where in your code, or version information in your program, and
a link back to this page from your project webpage.
