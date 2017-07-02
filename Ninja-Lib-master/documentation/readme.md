###Documentation
Information on the different assets formats used in each Phatasy Star game and how to extract them.  Tools I will be referencing are listed below. An index for how I define asset names is listed at the end of this document.

###Tools
Notable tools for extracting various assets. Will be referenced in the read me below.

|Tool name|Author|Description|
---|---|---|---
Noesis|Dick|Tool for exporting 3d models
HxD|Maël Hörz|General purpose hex editor
Puyo Tools|nickworonekin|DC/GC file export tools
VMT|Schthack|Texture Export Tools

###Phantasy Star Online ver. 2 (DC & PC)

| Asset | Exportable | Ninja-Lib | File Format |
---|---|---|---
Characters|○||.nj
Characters Animations|○|△|.pr2
Character Textures|○||.afs
Weapons|○||.nj
Set Pieces|○||.nj
Set Piece Animations|○||.nj
Enemies|○||.nj
Enemy Animations|○||.njm
Enemy Textures|○||.pvm
Stages|×||n.rel
Stage Textures|○||.pvm

###Phantasy Star Online: Blue Burst (PC)

| Asset | Exportable | Ninja-Lib | File Format |
---|---|---|---
Characters|○||.nj
Characters Animations|△||.pr2
Character Textures|○||.afs
Weapons|×||.xj
Set Pieces|×||.xj
Set Piece Animations|×||.xjm
Enemies Ep1&2|○||.nj
Enemy Animations Ep1&2|○|△|.njm2
Enemies Ep4|○||.nj
Enemy Animations Ep4|○||.njm
Enemy Textures|○||.xvm
Stages|△|△|n.rel
Stage Textures|○||.xvm

###Archive Formats

Archive formats are used consistently across each version of Phantasy Star Online. A description of each one is below.

**.gsl**  
Is an archive which generally contains files grouped by area. In PSOBB there is a single "data.gsl" file that contains all of the game's Epsisode I&II content. In the Dreamcast version of PSO gsl archives are used to group enemies and set pieces for each of the games stages (forest 1, forest 2, ect), likely to simpliy the process of loading and unloading each stage when reading from the GDRom.  More specific information on this file structure can be found in the "GSL_Format.txt" included in this repository.

**.afs**  
Is an archive file which generally contains a group of either textures or models. More specifically player textures, weapon models, and weapon textures are grouped in their own respective afs archives. The afs file includes a header for the location and length of each file included in the archive, but not the filename. When exporting files from an afs archive, it's necessary to look at the Interchange File Format header included in the first four bytes of the file to determine the appropriate extension for the contained files. 

**.bml**  
BML Archives are used to group various files of an entity into a single archive, specifically it is used to group the textures, animation and models for a given enemy into a single file that can be easily refernced and extracted. BML archives contain a header containing the file names and length of each file contained in the archive. Also note that every file in the archives is compressed with prs and needs to be decompressed when writing to the file system.

**.pvm/.xvm**  
PVM and XVM are identical in terms of functionality but differ slightly in implementation. Both act as containers for texture files, .pvr for PVM and .xvr for XVM respectively. PVM archives contain a list of the names of the texture files included in the header while XVM does not. To find the names of the files in a XVM achive, one needs to track down the Ninja Texture List (NJTL) header definition of the corresponding model to apply the names. Also .pvr are in a basic 16 bit rgba color structure while .xvr applies DXT compression on top of the pvr color format.

**.rel**  
 Sega places .rel files in several places in their file structure, so there doesn't seem to be any one specific use for when and where this file format is used. Though the most notable are the n.rel map files containing the stage model information. A .rel file can generally be described as a wrapper format for NJCM chuck files.
 
 
###File Formats

While there are several achive and compression files and formats which make the version 2 files look more complicated then they actually are, the assets themselves boil down to a few basic formats.

Basic Formats:  
**.nj**  
Is a 3d model format used in Dreamcast games defined in the Ninja_GD.pdf in the katana SDK documentation. The top of the file contains an NJTL header describing the textures and attributes of the textures used in the 3d model. And a NJCM, ninja chunk model body which contains a parent-sibling struct of nodes. Each node has a list of vertexes, normals and uv, and a list of indices describing the faces of the model.  

**.njm**  
Contains the Nina motion data for a given model. The file contains a single NNDM section which describes the number of key frames for each animation.

**.pvr**  
Is a lossy compressed image format used in several Dreamcast games. The header of the file contains the format, width and height. The color format for each file varies, but is generally constrained to a 16 bit format such as argb1555, rgb565, args4444.

While PSO version 2 only had a limited number of file formats used in the application, porting the game to Xbox and Gamecube must have introduced the dev team to a lot of new file formats and approached. Phantasy Star Online Blue Burst uses Dreamcast file formats for some files and extended, compressed, or otherwise modified versions of their prior counter parts.

Extended Formats:  
**.xj**   
Is a 3D file format similar to the .nj format from Version 2 but with serveral changes. The over all parent sibling and node structure hasn't changed, but the way the vertexes, indices and texture attributes are defined inside the file have been modified.

**.njm2**
Is used for all of the enemy animations used in Episode 1&2 for the Phantasy Star Online Blue Burst data. It's used for .nj models and is almost entirely identical to .njm aside from the spacing of key frames listed inside the file. This file can be read and rearranged back to a normal .njm file faily easily.

**.xjm**   
Is used for the Set Piece animations in Phantasy Star Online Blue Burst. In Blue Burst the most notable files to be changed from .nj to .xj are the weapons and set pieces. Weapon animations are programmed into the character motion data are are likely not applied to the weapons directly as far as is known. However for Set Pieces, such as doors and warps the animation is applied to the model, and this file variation of ninja motion is used.

**.xvr**  
Is a lossy image format used for textures. Likely picked up from when the game was ported to XBox, this file structure uses DXT compression to further reduce the size of the file. 

###Compression Formats

**.prs**  
A compression format more widely known as LZ77. It is often used in many Sega games as a lossless compression method. Special thanks to Fuzziqer who made the source for his PRS Utility public for members of the community to use. Prs compression is often used to compress files inside of archives. When a .prs file is in the file directly for data, it is often used for text.

**.pr2**  
While it seems to be a variation on prs, not much is known about this format. Most notably it is used to compress images for the lobby and the character motion animation files inside the game. This format can be decompressed with Tofuman's PRC Utility.

###Index
**Characters** Refers to the playable characters and classes such as Humar, or Ramar, etc. It also included NPC characters as they use the same file structure and animations.

**Weapons** Refers to any holdable weapon the character can use. Mags are also included in this category and are located in the same archive file as the player weapons.

**Set Pieces** Are objects included in environments which the player is able to interact with and is not an enemy or an NPC. These include containers, doors, switched, fences and other similar objects.

**Enemies** Are enemies outside of the lobby which the player is able to attack and defeat. Bosses are included in this category as they share the same format as other mobs.

**Stages** Refer to the maps, levels or locations in which the player, NPC's and enemies are placed in for the game to take place. This includes lobbies and areas such as the Forest or Ruins. 
