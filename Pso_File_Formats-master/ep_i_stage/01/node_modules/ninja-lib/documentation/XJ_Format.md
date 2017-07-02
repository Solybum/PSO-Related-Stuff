##XJ Ninja Model Defnition

Extension: "*.xj"  
Version: Phantasy Star Online BlueBurst PC  

Not exactly sure how or where the xj format came about, though it seems to be
the format used from Phatasy Star Onlinve Version I&II for Gamecube and onward.
So it could have been a new technique or format that the team picked up when
porting the game to different platoforms. While the format itself presents a
challenge in that there's little to no documentation available for it, the good
news is that it's a pretty straight forward format. It uses mostly 32 bit values,
and 16 bit values only on occasion making the data a lot easier to view. And it
seems that the team took the data directly from the old models and exported it
into the new format without changes to the original data. This means there are
parallels to work with and compare when analyzing this format.

### NJTL Ninja Texture List Defnition

With the exception of a few models, most models start with an NJTL texture list
at the top of the file. The NJTL specification is the same one used in the nj
files, so please refer to "NJ_Format.md" is this directory for that information.


### NJCM Ninja Chunk Model Definition

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

The initial object structure of xj starts off identical to its nj counter part.
And also 3d objects, such as the weapons which are in both .nj and .xj format
have the exact same values for eval flags such as [this example](http://pastebin.com/kM89aUFj)
which compares the initial values parsed from the saber nj model from version 2,
to its xj saber model counter part in psobb.

```
typedef struct {
  dword unknown1;
  NJS_VERTEX_LIST v_list;
  dword unknown2;
  NJS_INDICE_LIST t_list_a;
  dword unknown3;
  NJS_INDICE_LIST t_list_b,
  dword unknown4;
  Float center[3];
  Float radius;
 } NJS_MODEL_XJ;
 ```

This is where the model definition starts to change from the nj format. As opposed
to two points to sections, XJ has three pointers, one to the vertex list, one to
the first indice list, and another pointer to the third indice list. At the start
of this struct is a dword, with a dword entry following each pointer entry. As
of this time I do not know what purpose these serve, so I'll have to comapre values
from the xj models to values from the nj models to see if and where these values
come up.

```
typedef struct {
  dword unknown5;
  NJS_VERTEX_ENTRY vertexes[];
  dword unknown6;
  dword num_vertexes;
} NJS_VERTEX_LIST;
```

The structure for the NJS_VERTEX_LIST from NJS_MODEL_XJ is given above. There are
two unknown dwords in the struct, which I am not sure of their purpose along with
a pointer to the list of vertexes for the model and the number of vertexes in the
array. Each vertex entry is defined by the followign struct.

```
typedef struct {
  Float pos[3];
  Float normals[3];
  NJS_COLOR color;
  Float uv[2]
} NJS_VERTEX_ENTRY
```

Overall a pretty straightforward structure. Pos is three floats, one for x, y,
and z. Three normals, vertex color and two floats for uv. The structure for
NJS_COLOR is given below.

```
typedef struct {
 byte r;
 byte g;
 byte b;
 byte a;
} NJS_COLOR
```

Returning back to the definition for NJS_MODEL_XJ, the structure definition for
NJS_INDICE_LIST is as given blow.

```
typedef struct {
  dword texture_index;
  dword unknown7;
  word indice_list[];
  dword num_indices;
} NJS_INDICE_LIST;
```

The structure is actually surpiringly simple. The first entry is the texture index
number given by the texture list in NJTL file format in the begining of the file.
For example, the saber has three textures in an array, a 0 would indicate the first
texture in the list, while 2 would indicate the thrid. There's another dword here,
which I'm not sure of the purpose, followed by a pointer to an array of Uint16
values which describe the indices for the given list of vertices, and lastly is
a dword describing the number of UInt16's in the indice array.

With the exceptions of a few unknown dwords, to my knowledge, this is the complete
definition for the .xj file type as structures described here fill-in inbetween
eachother. All of the data in the file is parsable, the problem I am currently running
into is how to evaluate the flags, how to iterate over and draw each node in the structure,
and how to apply and calculate the translations and rotations for each model.
