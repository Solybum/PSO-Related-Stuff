--------------------------------------------------------------------------------
                            Ninja Model
--------------------------------------------------------------------------------

Extension: "*.nj"
Version: Phantasy Star Online Version 2 PC

Sega liked to use traditional Japanese names to describe their projects. "Katana"
is the name of their SDK for the Dreamcast. "Shinobi" is the name of their audio
library and following the trend, "Ninja" is the name of their graphics library.
As such, most file formats involving graphics has the prefix of "Ninja".

The models are defined by a "Ninja Chunk Model" format which used nodes organized
in a parent slibling tree structure. More on that later. The names of the textures
are given in a "Ninja Texture List", which an array of strings often found at the
top of the file with the names of the textures used for the model.

The Ninja Chunk Model and Ninja Texture structures are used in other files besides
the .nj files, they are also used in the map .rel files without the Interchange
format header attached. Luckly there are some simple patterns that help out when
it comes to recognizing when and where these structures are used.

--------------------------------------------------------------------------------
                           NJTL File Format
--------------------------------------------------------------------------------

The NJTL starts off with an interchange file format header which includes a
String to identify the format, followed by a dword for the length of the format.

```
typedef struct {
  char identifier[4];  
  dword byte_length;
} IFF_HEADER;
```

The NJTL chunk will start following the IFF header, so either trim the file,
or add the offset of the current position to the pointers. The NJTL structure
then starts off with two entries. The first is the address to the array of
structs NJS_TEXNAME and the second gives the number of structs in the array.

```
typedef struct {
  NJS_TEXNAME *textures;    /* Texture name list */
  Uint16 nbTexture;         /* Number of textures */
} NJS_TEXLIST;
```

The structure for the NJS_TEXNAME struct is given below. The first entry
is a pointer to the start of the texture's filename. The second entry is
an attribute and the third entry is a memory pointer. In every file I have
seen both of these entries always have the value of zero.

```
 typedef struct {
 void *filename;           /* Texture file name */
 Uint32 attr;              /* Texture attributes */
 Void *texaddr;            /* Texture memory address */
 } NJS_TEXNAME;
```

So NJTL is just an array of string with the texture names for a given model.
It's pretty easy to find in a file as the filenames standout really easily against
the background. If you see an 4 byte int value by two 4 byte zero values, it's
also easy to tell those are the starting pointers for the texture filenames.

--------------------------------------------------------------------------------
                           NJCM File Format
--------------------------------------------------------------------------------

The NJCM is idenfifier for the Ninja Model Chunk format Sega used to define the
game's 3d objects. It follows the NJTL header, though in some models there is
no NJTL header, in which case it will be at the top of the file.

```
typedef struct {
  char identifier[4];
  dword byte_length;
} IFF_HEADER;
```

The NJCM chunk will start following the IFF header, so either trim the file,
or add the offset of the current position to the pointers. Following that
will be the first entry for the parent node, which uses the following format.

```
typedef struct obj {
  Uint32 evalflags;                /* Evaluation method optimization flag */
  NJS_MODEL *model;                /* Model structure pointer */
  Float pos[3];                    /* Parallel motion */
  Angle ang[3];                    /* Rotation */
  Float scl[3];                    /* Scale */
  struct obj *child;               /* Child object pointer */
  struct obj *sibling;             /* Sibling object pointer */
} NJS_OBJECT;
```

The eval flags are binary flags, more information on that will be listed at the
end of this readme. The NJS_MODEL is a pointer to the information defining the
node's model. The Float pos[] is are x,y,z translations when writing the vertex.
The angle is a signed int, 0x000 is 0 and 0xFFFF corresponds to 360 degrees.
Scale is a scaler value for the model which is every case I've seen is simply,
[1,1,1] or [0x0000803f,0x0000803f,0x0000803f] in every model I have seen. Child
and sibling point to other nodes.

```
typedef struct {
 NJS_VERTEX_LIST *points;        /* Vertex list */
 NJS_INDICE_LIST *indices;       /* Indice list */
 Float center[3];                /* Model center */
 Float r;                        /* Radius of circumscribed sphere */
 } NJS_MODEL;
 ```

 The defition for NJS_MODEL is pretty simple. It contains two points, one to the
 vertex list and another to the indice list followed by a three floats for the
 x,y,z center of the model node and lastly a radius given by a float value.

```
typedef struct {
  unsigned short Format;          /* Seems to always be 0x2900 */
  unsigned short unknown1;        /* No idea */
  unsigned short Flags;           /* Seems to always be 0x0000 */
  unsigned short Num_Vertexes;    /* Number of vertexes in Array */
  NJS_VECTOR VertexData[]         /* Array of x,y,z floats */
}NJS_VERTEX_LIST
```

Sega doesn't give an accurate description of this structure in their Katana SDK
PDF guide, as such I don't know evactly what's going on. The Vertex List starts
with four unsigned 16 bit values. The format seems to always be 0x2900, followed
by a number which I am currently unsure of its use, followed by zero, followed by
the number of vertexes in the VertexData array. The end of the VertexData is also
marked in the file with 0xFF000000. Sega's datatype definition for NJS_Vector is
as given below.

```
 typedef struct {
 Float x; /* X value */
 Float y; /* Y value */
 Float z; /* Z value */
 } NJS_POINT3, NJS_VECTOR;
 ```
