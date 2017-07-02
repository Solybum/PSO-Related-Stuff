##N.REL STAGE MODEL DEFINITION

Extension: "n.rel"  
Version: Phantasy Star Online Version 2 PC  

Start at EOF -16 and read a dword to a pointer to the header of the file.

```
struct Header {
  dword num_section;
  dword magic_number;
  MapSection* map_section[];
  Texture_List* texture_list;
}
```

The Header is pretty simple. The first dword is an int value for the number of MapSections. The second dword seems to be some kind of magic number or identifier,"..HD", in every file. The third entry is a pointer to the array of MapSection entries. And the texture_list is a pointer to the texture entries.

```
typedef struct {
  NJS_TEXNAME *textures;    /* Texture name list */
  Uint16 nbTexture;         /* Number of textures */
} NJS_TEXLIST;
```

The textures are actually the same format as NJTL, simply without the IFF header in front of it. The pointer from the header contains a pointer to the start of the texture list and the second is the number or textures in the list.

```
 typedef struct {
 void *filename;           /* Texture file name */
 Uint32 attr;              /* Texture attributes */
 Void *texaddr;            /* Texture memory address */
 } NJS_TEXNAME;
```

The texture list is also identical to NJTL. Each entry is made up of three dwords. The first being the start pointer to the texture name string. The second and third entries seem to be for attributes but are 0 in every file I have looked at. The filenames come directly before the NJS_TEXTNAME struct, so the pointer from NJS_TEXTLIST will mark the end of the last filename.

```
typedef struct {
  dword section_id;
  dword zero[6];
  single radius;
  Unkown_Attr* unknown1[];
  Model_Pointer* model_array[];
  dword pointer3;
  dword num_of_unknown1;
  dword num_of_model_array;
  dword num_of_pointer3;
  dword terminate;
} MapSection;
```

I need to go back and verify this structure against a couple of other files. But the basics for this structure are actually pretty simple. In a normal .nj file the NJCM chunks are arranged in a tree model for the purpose of animation and bones.  
In maps, the model seems to take priority, so each map section is made up of a list of NJCM models with no children or siblings. So this struct here points to a list of pointers to NJCM chunk models which make up the map section.  
The first entry is the number of the map section. This number should be incremental. Following that is six zeros, though for the file I am currently looking at to write this readme. This space may include the center or rotation information for the section. Following that is a Float which is likely the radius.  
After that is pointer to an array of unkown, I'll get to that in a second. The second pointer is to the list of models and the third is likely a pointer as well, but not in the reference file I'm currently looking at, so I'll have to cross reference that. The next three dwords are the number of entries for each respective array pointer in the struct. The last entry in the struct I have labeled as "terminator". Likely not the case, but it always seems to have a value of 0x1000 and I don't know what it's for. So it's a good value to look for when reading the structure.

```
typedef struct {
  dword zero[2];
  dword num;
} Unkown_Attr;
```

This is the unkown attribute I mention above and am including it for completeness. Each entry in this array seems to always be two dword zeros followed by 0x1000. Not sure what it's for, so if anyone wants to edit these values, open the client see what changes and report back to me I will include it in this readme.

```
typedef struct {
  NJS_OBJECT* njcm;
  dword zero[10];
  dword attr;
} Model_Pointer;
```

This is the formentioned model array. The first dword is the address of the NJS_OBJECT. Yes, the exact same NJS_OBJECT as in NJ files, followed by ten dword zero entires, followed by some int value on the end.

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

Once we're here, we should be in familiar territory. It's the exact same definition as the NJCM chunks in the normal NJ files. The child and sibling entries will be zero for all of these.

```
typedef struct {
 NJS_VERTEX_LIST *points;        /* Vertex list */
 NJS_INDICE_LIST *indices;       /* Indice list */
 Float center[3];                /* Model center */
 Float r;                        /* Radius of circumscribed sphere */
 } NJS_MODEL;
 ```

 The NJS_MODEL entry from the NJS_OBJECT definition is also the same. It points to a vertice list directly above the struct and an indice/texture list directly above that. Following that is the standard center, radius.

 ```
 typedef struct {
   unsigned short Format;          /* Seems to always be 0x2900 */
   unsigned short unknown1;        /* No idea */
   unsigned short Flags;           /* Seems to always be 0x0000 */
   unsigned short Num_Vertexes;    /* Number of vertexes in Array */
   NJS_VECTOR VertexData[]         /* Array of x,y,z floats */
 }NJS_VERTEX_LIST
 ```

 The vertex list is again the exact same as it's NJ definition. I've been working on trying to document this format. The first short gives the format of the vertices in the VertexData array following it. So I'll come back and update either this readme or the NJ readme, once I get more information.

 ```
typedef struct{
  ???
} NJS_INDICE_LIST;
 ```

This is a structure that I'm still working on as the contents seem to be very dynamic. So far I get that this section declares the texture number, lists of indices in groups, and uv values. The problem is that it does it in a way that's horribly jumbled making it hard to tell where one list stops and the next one begins. Once I get more information on here I'll add it. Though thanks to the Ninja Ascii format in the Katana docs, I've finally making some headway on this wonkey section.

But over all that's all maps are, a pointer to a common NJTL section referenced by all of the models in the file and a list of sections which contains a list of models that make up the actual map. Everything in is NJTL and NJCM, so there's nothing new, just a remix of existing structures. 
