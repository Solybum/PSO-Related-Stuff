unit Unit1;

interface

uses
  Windows, Messages, SysUtils, Variants, Classes, Graphics, Controls, Forms,
  Dialogs, StdCtrls, Direct3D9,D3DX9, Spin, ExtCtrls, DXInput;

const  D3DFVF_CUSTOMVERTEX = D3DFVF_XYZ or D3DFVF_NORMAL or D3DFVF_DIFFUSE  or D3DFVF_TEX1;
       DXT5_Header: string =
        #$44#$44#$53#$20#$7C#$00#$00#$00#$07#$10#$08#$00#$00#$01#$00#$00#$00#$01#$00#$00#$00#$00
        +#$01#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00
        +#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00
        +#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$20#$00#$00#$00#$04#$00#$00#$00#$44#$58#$54#$35
        +#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$10
        +#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00;
       DXT1_Header: string =
        #$44#$44#$53#$20#$7C#$00#$00#$00#$07#$10#$08#$00#$40#$00#$00#$00#$40#$00#$00#$00#$00#$08
        +#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00
        +#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00
        +#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$20#$00#$00#$00#$04#$00#$00#$00#$44#$58#$54#$31
        +#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$10
        +#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00#$00;

type
    TXVMHeader = record
        Flag:dword;
        Size:dword;
        count:dword;
        unused:array[0..12] of dword;
    end;
    TXVRHeader = record
        Flag:dword;
        Size:dword;
        PixelFormat:dword;
        DXTFormat:dword;
        ID:Dword;
        sx,sy:word;
        DataSize:dword;
        unused:array[0..8] of dword;
    end;
    TMapSection = Record
        ID:dword;
        dx,dz,dy:single;
        unknow1:dword;
        Rotation:dword;
        unknow3:dword;
        unknow4:single;
        VertexA_Off:dword;
        VertexB_Off:dword;
        VertexA_Count:dword;
        VertexB_Count:dword;
        unknow8:dword;
    end;
    TBlockVertex = record
        Offset:dword;
        unknow1:dword;
        unknow2:dword;
        Flag:dword;
    end;
    TExtendedBlockVertex = record
        Offset:dword;
        unknow1:dword;
        unknow2:dword;
        unknow3:dword;
        unknow4:dword;
        unknow5:dword;
        unknow6:dword;
        Flag:dword;
    end;
    TCustomMaterial = Record
        a:array[0..14] of single;
    end;
    TCustomVertex = record
        px,pz,py: single; // vertex pos
        color:dword; //vertex color
        tu, tv:Single;   // texture uv
    end;
    TCustomVertex2 = record
        px,pz,py,nx,nz,ny: single; // vertex pos
        color:dword; //vertex color
        tu, tv:Single;   // texture uv
    end;
    TVertexList = Record
        data:array of TCustomVertex2;
        indice:array of array of word;
        indicecount:array of word;
        indicecountcount:word;
        textureID:array of integer;
        indiceAlpha:array of array of word;
        indiceAlphacount:array of word;
        indiceAlphacountcount:word;
        textureIDAlpha:array of integer;
        duno:TCustomMaterial;
    end;
    TMapSectionData = record
        VBlock:array of TBlockVertex;
        EVBlock:array of TExtendedBlockVertex;
        VList:array of TVertexList;
        EVList:array of TVertexList;
        VListCount,EVListCount:array of integer;
    end;
  TForm1 = class(TForm)
    Button1: TButton;
    Label1: TLabel;
    Label2: TLabel;
    Label3: TLabel;
    Label4: TLabel;
    ListBox1: TListBox;
    Label5: TLabel;
    Label6: TLabel;
    Label7: TLabel;
    Label8: TLabel;
    Panel1: TPanel;
    Label9: TLabel;
    CheckBox1: TCheckBox;
    Timer1: TTimer;
    Timer2: TTimer;
    Label11: TLabel;
    DXInput1: TDXInput;
    Button2: TButton;
    Button3: TButton;
    Button4: TButton;
    Button5: TButton;
    procedure Button1Click(Sender: TObject);
    procedure FormShow(Sender: TObject);
    procedure CheckBox1Click(Sender: TObject);
    procedure Panel1MouseMove(Sender: TObject; Shift: TShiftState; X,
      Y: Integer);
    procedure Panel1MouseDown(Sender: TObject; Button: TMouseButton;
      Shift: TShiftState; X, Y: Integer);
    procedure Timer1Timer(Sender: TObject);
    procedure Timer2Timer(Sender: TObject);
    procedure Button2Click(Sender: TObject);
    procedure Button3Click(Sender: TObject);
    procedure Button4Click(Sender: TObject);
    procedure Button5Click(Sender: TObject);

  private
    { Private declarations }
  public
    { Public declarations }
  end;
   PCustomVertexArray = ^TCustomVertexArray;
  TCustomVertexArray = array [0..MaxInt div SizeOf(TCustomVertex2)-1] of TCustomVertex2;

var
  Form1: TForm1;
  MapSection:array of TMapSection; //map section data
  MapSectionCount:integer;
  MapSectionData:array of TMapSectionData;
  tex:array of IDirect3DTexture9;
  textype:array of dword;
  mytick,lmx,lmy,fps:integer;
  rotate:boolean;
  g_pD3D: IDirect3D9 = nil; // Used to create the D3DDevice
  g_pd3dDevice: IDirect3DDevice9 = nil; // render device
  g_pVB: IDirect3DVertexBuffer9 = nil; // vertex buffer
  eyeptx,eyepty,eyeptz,vz,vr:single;


implementation

uses Unit2;

{$R *.dfm}

{Function MakeMyVertex(v:tcustomvertex2;l:integer):TD3DVertex;
begin
    result.x:=v.px;
    result.y:=v.pz;
    result.z:=v.py;
    //result.dvX:=v.nx;
    //result.dvy:=v.nz;
    //result.dvz:=v.ny;
    result.tu:=v.tu;
    result.tv:=v.tv;
end; }

Function MakeRVB(t:integer):integer;
var c:integer;
begin
    c:=((t div $400) and $1F) *8;
    c:=c+((((t div $20) and $1f) *8)*256);
    c:=c+((((t div $1) and $1f) *8)*65536);
    if t and $7fff = 0 then c:=$10101;
    if t and $8000 <> $8000 then c:=$0;
    result:=c;
end;

Function twiddled_vq(sx:integer;p,p2:pchar):integer;
var x,y,ptr:integer;
    vqtable:array[0..4*256] of dword;
    c:word;
    TT:array[0..1023] of integer;
    m:pchar;
    b:Tbitmap;
    ts:Tstream;
begin
    b:=TBitmap.Create;
    b.Width:=sx;
    b.Height:=sx;
    b.TransparentColor:=0;
    b.Transparent:=true;
    ptr:=0;
    for x:=0 to 1023 do
    tt[x] := (x and 1)or((x and 2)*2)or((x and 4)*4)or((x and 8)*8)or((x and 16)*16)or
      ((x and 32)*32)or((x and 64)*64)or((x and 128)*128)or((x and 256)*256)or((x and 512)*512);
    for x:=0 to 1023 do
    begin
       vqtable[x]:=MakeRVB(byte(p[ptr])+(byte(p[ptr+1])*256));
       ptr:=ptr+2;
    end;
    m:=@p[ptr];
    for y:=0 to (sx div 2)-1 do
        for x:=0 to (sx div 2)-1 do begin
            c:=byte(m[tt[y] or (tt[x]*2)]);
            //vq:=@vqtable[c*4];
            b.Canvas.Pixels[x*2,y*2]:=vqtable[(c*4)];
            b.Canvas.Pixels[(x*2)+1,y*2]:=vqtable[(c*4)+2];
            b.Canvas.Pixels[x*2,(y*2)+1]:=vqtable[(c*4)+1];
            b.Canvas.Pixels[(x*2)+1,(y*2)+1]:=vqtable[(c*4)+3];
        end;
    ts:=TMemoryStream.Create;
    b.SaveToStream(ts);
    result:=ts.Size;
    ts.Position:=0;
    ts.ReadBuffer(p2[0],result);
    ts.Free;
end;

function InitD3D(hWnd: HWND): HRESULT;
var
  d3dpp: TD3DPresentParameters;
  vp: TD3DViewport9;
  mtrl: TD3DMaterial9;
  matProj,matView: TD3DMatrix;
begin
  Result:= E_FAIL;//set to fail 1st

  //create D3D object
  g_pD3D := Direct3DCreate9(D3D_SDK_VERSION);
  if (g_pD3D = nil) then Exit;

  // Set up the structure used to create the D3DDevice
  FillChar(d3dpp, SizeOf(d3dpp), 0);
  d3dpp.Windowed := True;
  d3dpp.SwapEffect := D3DSWAPEFFECT_DISCARD;
  d3dpp.BackBufferFormat := D3DFMT_UNKNOWN;

  //used for back buffer
  d3dpp.EnableAutoDepthStencil:=true;
  d3dpp.AutoDepthStencilFormat := D3DFMT_D16;

  // Create the D3DDevice
  Result:= g_pD3D.CreateDevice(D3DADAPTER_DEFAULT, D3DDEVTYPE_HAL, hWnd,
                               D3DCREATE_HARDWARE_VERTEXPROCESSING,
                               @d3dpp, g_pd3dDevice);
  if FAILED(Result) then
  begin
    Result:= E_FAIL;
    Exit;
  end;

  if FAILED(g_pd3dDevice.CreateVertexBuffer(3000*SizeOf(TCustomVertex2),
                                            0, D3DFVF_CUSTOMVERTEX,
                                            D3DPOOL_DEFAULT, g_pVB, nil))
    then Exit;



  FillChar(vp, SizeOf(vp), 0);
  vp.X := 0;
  vp.Y := 0;
  vp.Width := form1.Panel1.Width;
  vp.Height := form1.Panel1.Height;
  vp.MinZ := 0.0;
  vp.MaxZ := 1.0;

  g_pd3dDevice.SetViewport(vp);


  FillChar(mtrl, SizeOf(mtrl), 0);
  mtrl.ambient.r := 1.0;
  mtrl.ambient.g := 1.0;
  mtrl.ambient.b := 1.0;
  mtrl.diffuse.r := 1.0;
  mtrl.diffuse.g := 1.0;
  mtrl.diffuse.b := 1.0;
  mtrl.diffuse.a := 1.0;
  g_pd3dDevice.SetMaterial( mtrl );


  // Set the projection matrix. Note that the view and world matrices are
  // set in the App_FrameMove() function, so they can be animated each
  // frame.
  FilLChar(matProj, SizeOf(matProj), 0);
  matProj._11 :=  2.0;
  matProj._22 :=  2.0;
  matProj._33 :=  1.0;
  matProj._34 :=  1.0;
  matProj._43 := -1.0;
  g_pd3dDevice.SetTransform( D3DTS_PROJECTION, matProj );

  FilLChar(matView, SizeOf(matView), 0);
  matView._11 := 1;
  matView._22 := 1.4;
  matView._23 := 0.15;
  matView._32 := 0.2;
  matView._33 := 0.2;
  matView._43 := 19.0;
  matView._44 := 1.0;
  g_pd3dDevice.SetTransform( D3DTS_VIEW, matView);


  // Turn off D3D lighting,cauz I use my own vertex color white white white XD!
  g_pd3dDevice.SetRenderState(D3DRS_LIGHTING, iFalse);

  //test
  {g_pd3dDevice.SetRenderState(D3DRS_SHADEMODE,D3DSHADE_PHONG);
  g_pd3dDevice.SetRenderState(D3DRS_ANTIALIASEDLINEENABLE, iTRUE);}

  g_pd3dDevice.SetRenderState( D3DRS_AMBIENT, $FFFFFFFF);

   
  g_pd3dDevice.SetRenderState(D3DRS_ZENABLE,D3DZB_TRUE );
  g_pd3dDevice.SetRenderState(D3DRS_ZWRITEENABLE,itrue);


  //o_O i use this for active alpha blending!
  g_pd3dDevice.SetRenderState(D3DRS_ALPHABLENDENABLE, iTRUE);
  //enable verification if transparency lvl under 16 then dont display the pixel
  //this prevent single alpha bit texture to hide other pixel on the transparent spot
  //without actualy sorting the polygon dept
  g_pd3dDevice.SetRenderState(D3DRS_ALPHAFUNC, D3DCMP_GREATEREQUAL);
  g_pd3dDevice.SetRenderState(D3DRS_ALPHAREF, 16);
  g_pd3dDevice.SetRenderState(D3DRS_ALPHATESTENABLE, iTRUE);
  
  g_pd3dDevice.SetRenderState(D3DRS_SRCBLEND,D3DBLEND_SRCALPHA);//source blend factor
  g_pd3dDevice.SetRenderState(D3DRS_DESTBLEND,D3DBLEND_INVSRCALPHA);//destination blend factor
  // double sided!
  g_pd3dDevice.SetRenderState(D3DRS_CULLMODE, D3DCULL_NONE);





  Result:= S_OK;
end;

Function AdjustVertex(v:tcustomvertex2;l,k:integer):tcustomvertex2;
var R:single;
begin
    //get the rotation value compatible with my way to rotate
    //this is the code i came with to rotate vertex, if you know better, just edit this
    r:=0;
    if MapSection[l].Rotation <> 0 then
    r:=MapSection[l].Rotation / 10430.378350;
    result.px:=v.px+MapSectionData[l].VList[k].duno.a[0];
    result.px:=(result.px*sin(r))+(result.px*cos(r));
    result.py:=v.py+MapSectionData[l].VList[k].duno.a[2];
    result.py:=(result.py*sin(r))-(result.py*cos(r));

    result.px:=result.px+MapSection[l].dx;
    result.py:=result.py-MapSection[l].dy;
    result.pz:=v.pz+MapSection[l].dz +MapSectionData[l].VList[k].duno.a[1];
    result.nx:=1;
    result.ny:=0;
    result.nz:=0;
    result.color:=v.color;
    result.tu:=v.tu;
    result.tv:=v.tv;
end;

Function AdjustVertexB(v:tcustomvertex2;l,k:integer):tcustomvertex2;
var R:single;
begin
    //get the rotation value compatible with my way to rotate
    //this is the code i came with to rotate vertex, if you know better, just edit this
    r:=0;
    if MapSection[l].Rotation <> 0 then
    r:=MapSection[l].Rotation / 10430.378350;
    result.px:=v.px+MapSectionData[l].EVList[k].duno.a[0];
    result.px:=(result.px*sin(r))+(result.px*cos(r));
    result.py:=v.py+MapSectionData[l].EVList[k].duno.a[2];
    result.py:=(result.py*sin(r))-(result.py*cos(r));

    result.px:=result.px+MapSection[l].dx;
    result.py:=result.py-MapSection[l].dy;
    result.pz:=v.pz+MapSection[l].dz +MapSectionData[l].EVList[k].duno.a[1];
    result.nx:=1;
    result.ny:=0;
    result.nz:=0;
    result.color:=v.color;
    result.tu:=v.tu;
    result.tv:=v.tv;
end;

Function MakeMyVertex2(v:tcustomvertex):tcustomvertex2;
begin
    result.px:=v.px;
    result.py:=v.py;
    result.pz:=v.pz;
    result.nx:=1;
    result.ny:=0;
    result.nz:=0;
    result.color:=v.color;
    result.tu:=v.tu;
    result.tv:=v.tv;
end;

Function LoadTextureFile(s:string):boolean;
var h:TXVMHeader;
    b:TXVRHeader;
    f,f2,i,x:integer;
    p,p2:pchar;
begin
    f:=fileopen(s,$40); //open xvm file
    fileread(f,h,$40);  //read the header
    setlength(tex,h.count); //set texture memory
    setlength(textype,h.count); //set texture flag memory
    for i:=0 to h.count-1 do begin
        fileread(f,b,$40); //read the xvr header
        p:=allocmem(b.Size+128); //reserve memory for data+DDS header
        fileread(f,p[128],b.Size-$38); //read the data
        textype[i]:=b.PixelFormat;
        if b.DXTFormat = 3 then begin
            //old format, convert to bmp first
            textype[i]:=0;
            p2:=allocmem(3000000);
            x:=twiddled_vq(b.sx,@p[128],p2);
            D3DXCreateTextureFromFileInMemory(g_pd3dDevice,p2,x,tex[i]);
            freemem(p2);
        end else begin
        if b.DXTFormat = 6 then move(DXT1_Header[1],p[0],128) //DXT1 header
        else move(DXT5_Header[1],p[0],128); //DXT3 header
        move(b.sx,p[12],2); //set the X size
        move(b.sy,p[16],2); //set the Y size
        move(b.datasize,p[20],4); //set the data size

        D3DXCreateTextureFromFileInMemory(g_pd3dDevice,p,b.DataSize+128,tex[i]);
        end;
        freemem(p);
    end;
    fileclose(f);
end;

function MapOpen(s:string):boolean;
var y,l,m,r,texoff,c,blockcount,vertexcount,k,ic,f,o,e,q:integer;
    ic2,c2:integer;
    texname:array[0..127] of char;
    data:TCustomVertex;
    //point:array[0..255] of word;    }
begin
    //open and point to the map area data
    result:=false;
    blockcount:=0;
    vertexcount:=0;
    y:=fileopen(s,$40);  // open the file
    if y >0 then begin   // if it success then read the file
    FileSeek(y,-16,2);   //get the pointer to the header area
    fileread(y,r,4);
    fileseek(y,r+8,0);   //seek to the position
    fileread(y,m,4);     //number of area to read
    fileread(y,r,4);
    fileread(y,r,4);     //pointer to first area data
    fileread(y,texoff,4); //texture list pointer
    fileseek(y,r,0);
    //read all the map data amount of M at pointer R
    MapSectionCount:=m;
    setlength(MapSection,m);        //prepare the memory to receive the data
    setlength(MapSectionData,m);
    fileread(y,MapSection[0],m*$34);  //real all the area in 1 block
    //now load eatch block vertex header
    for m:=0 to MapSectionCount-1 do begin
        //set the memory
        setlength(MapsectionData[m].VBlock,MapSection[m].VertexA_Count);
        setlength(MapsectionData[m].EVBlock,MapSection[m].VertexB_Count);
        setlength(MapsectionData[m].VList,MapSection[m].VertexA_Count);
        setlength(MapsectionData[m].EVList,MapSection[m].VertexB_Count);
        setlength(MapsectionData[m].VListCount,MapSection[m].VertexA_Count);
        setlength(MapsectionData[m].EVListCount,MapSection[m].VertexB_Count);
        //seek to first 3d chunk of data and read them all
        fileseek(y,MapSection[m].VertexA_Off,0);
        fileread(y,MapSectionData[m].VBlock[0],MapSection[m].VertexA_Count*16);
        //seek to first 3d chunk of data format B and read them all
        //note i dont know whats the diference so for now i treat them as normal vertex
        fileseek(y,MapSection[m].VertexB_Off,0);
        fileread(y,MapSectionData[m].EVBlock[0],MapSection[m].VertexB_Count*32);
        //now load all vertex list from the block
        for l:=0 to MapSection[m].VertexA_Count-1 do begin
            inc(blockcount);

            if MapSectionData[m].VBlock[l].Flag and $4 = $4 then begin
                //the entry is a reference to an existing block data load it
                fileseek(y,MapSectionData[m].VBlock[l].Offset,0);
                fileread(y,MapSectionData[m].VBlock[l],16);   //get the block pointer
            end;

            fileseek(y,MapSectionData[m].VBlock[l].Offset+4,0);
            fileread(y,r,4);   //get the block pointer
            if r <> 0 then begin
            fileread(y,MapSectionData[m].VList[l].duno,12);
            fileseek(y,r+4,0);
            fileread(y,r,4);    //pointer to information of the vertex list
            //the indice list
            fileread(y,c,4);
            fileread(y,c,4);    //go read teh first indice list
            fileread(y,ic,4);   //number of list
            fileread(y,c2,4);    //go read teh next indice list
            fileread(y,ic2,4);   //number of list
            MapSectionData[m].VList[l].indicecountcount:=ic;
            MapSectionData[m].VList[l].indiceAlphacountcount:=ic2;
            //set the memory for the indice
            setlength(MapSectionData[m].VList[l].indice,ic);
            setlength(MapSectionData[m].VList[l].indicecount,ic);
            setlength(MapSectionData[m].VList[l].Textureid,ic);
            setlength(MapSectionData[m].VList[l].indiceAlpha,ic2);
            setlength(MapSectionData[m].VList[l].indiceAlphacount,ic2);
            setlength(MapSectionData[m].VList[l].TextureidAlpha,ic2);

            for f:=0 to ic-1 do begin  //load eatch of them (eatch one make an item or object)
            {if (l = 54) and (f=12) then
                q:=4;     }
            fileseek(y,c,0);  //seek to the entry
            inc(c,20);        //prepare for next entry
            fileread(y,q,4);
            fileread(y,o,4);
            fileread(y,e,4);  //get the offset
            fileread(y,k,4);  //get the amount of index
            fileseek(y,e,0);  //seek to it
            setlength(MapSectionData[m].VList[l].indice[f],k); //reserve teh memory
            fileread(y,MapSectionData[m].VList[l].indice[f][0],k*2); //read them all
            MapSectionData[m].VList[l].indicecount[f]:=k;
            //read the texture number
            if o <> 0 then begin
            if o = 4 then inc(q,16);
            fileseek(y,q+4,0);
            fileread(y,MapSectionData[m].VList[l].textureid[f],4);
            end else if f>0 then MapSectionData[m].VList[l].textureid[f]:=MapSectionData[m].VList[l].textureid[f-1] //last used texture
                else MapSectionData[m].VList[l].textureid[f]:=-1; //if no texture then set 0 in case

            end;

            for f:=0 to ic2-1 do begin  //load eatch of them (eatch one make an item or object)
            fileseek(y,c2,0);  //seek to the entry
            inc(c2,20);        //prepare for next entry
            fileread(y,q,4);
            fileread(y,o,4);
            fileread(y,e,4);  //get the offset
            fileread(y,k,4);  //get the amount of index
            fileseek(y,e,0);  //seek to it
            setlength(MapSectionData[m].VList[l].indiceAlpha[f],k); //reserve teh memory
            fileread(y,MapSectionData[m].VList[l].indiceAlpha[f][0],k*2); //read them all
            MapSectionData[m].VList[l].indiceAlphacount[f]:=k;
            //read the texture number
            if o <> 0 then begin
            if o = 4 then inc(q,20)
            else inc(q,4);
            fileseek(y,q,0);
            fileread(y,MapSectionData[m].VList[l].textureidAlpha[f],4);
            end else if f>0 then MapSectionData[m].VList[l].textureidAlpha[f]:=MapSectionData[m].VList[l].textureidAlpha[f-1]
                else MapSectionData[m].VList[l].textureidAlpha[f]:=-1;
            end;

            fileseek(y,r+4,0);  //final pointer to the header, seek to it
            fileread(y,r,4); //data offset
            fileread(y,c,4); //size of 1 vertex
            fileread(y,MapSectionData[m].VListCount[l],4); //amount of vertex
            r:=fileseek(y,r,0);  //load the vertex list
            //reserve memory
            setlength(MapSectionData[m].VList[l].data,MapSectionData[m].VListCount[l]);
            {if l = 49 then
                r:=30;     }
            if c = $10 then begin
                //here a XYZ + Difuse format
                data.tu:=0;
                data.tv:=0;
                for o:=0 to MapSectionData[m].VListCount[l]-1 do begin
                    //read and convert to a custom format and adjust the x,y,z for the area
                    fileread(y,data,$10);
                    MapSectionData[m].VList[l].data[o]:=adjustvertex(makemyvertex2(data),m,l);
                end;
            end else
            if c = $18 then begin
                //here a XYZ + Difuse + TEX1
                for o:=0 to MapSectionData[m].VListCount[l]-1 do begin
                    //read and convert to a custom format and adjust the x,y,z for the area
                    fileread(y,data,$18);
                    MapSectionData[m].VList[l].data[o]:=adjustvertex(makemyvertex2(data),m,l);
                end;
            end else if c = $1c then begin
                //Same as my Custom format but no tex. XYZ + XYZ_NORMAL + Diffuse
                for o:=0 to MapSectionData[m].VListCount[l]-1 do begin
                    //read and adjust the x,y,z for the area
                    fileread(y,MapSectionData[m].VList[l].data[o],$1c);
                    MapSectionData[m].VList[l].data[o].tu:=0;
                    MapSectionData[m].VList[l].data[o].tv:=0;
                    MapSectionData[m].VList[l].data[o]:=adjustvertex(MapSectionData[m].VList[l].data[o],m,l);
                end;
            end else if c = $24 then begin
                //Same as my Custom format XYZ + XYZ_NORMAL + Diffuse + TEX1
                for o:=0 to MapSectionData[m].VListCount[l]-1 do begin
                    //read and adjust the x,y,z for the area
                    fileread(y,MapSectionData[m].VList[l].data[o],$24);
                    MapSectionData[m].VList[l].data[o]:=adjustvertex(MapSectionData[m].VList[l].data[o],m,l);
                end;
            end else begin
                  MessageDlg('Unknow Vertex format '+inttohex(c,4)+' at '+inttohex(r,8), mtInformation,[mbOk], 0);
                exit;
            end;
            inc(vertexcount,MapSectionData[m].VListCount[l]);
            end;
        end;


        //same as baefor for groupe b
        for l:=0 to MapSection[m].VertexB_Count-1 do begin
            inc(blockcount);

            if MapSectionData[m].EVBlock[l].Flag and $4 = $4 then begin
                //the entry is a reference to an existing block data load it
                fileseek(y,MapSectionData[m].EVBlock[l].Offset,0);
                fileread(y,MapSectionData[m].EVBlock[l],16);   //get the block pointer
            end;

            fileseek(y,MapSectionData[m].EVBlock[l].Offset+4,0);
            fileread(y,r,4);   //get the block pointer
            if r <> 0 then begin
            fileread(y,MapSectionData[m].EVList[l].duno,12);
            fileseek(y,r+4,0);
            fileread(y,r,4);    //pointer to information of the vertex list
            //the indice list
            fileread(y,c,4);
            fileread(y,c,4);    //go read teh first indice list
            fileread(y,ic,4);   //number of list
            fileread(y,c2,4);    //go read teh next indice list
            fileread(y,ic2,4);   //number of list
            MapSectionData[m].EVList[l].indicecountcount:=ic;
            MapSectionData[m].EVList[l].indiceAlphacountcount:=ic2;
            //set the memory for the indice
            setlength(MapSectionData[m].EVList[l].indice,ic);
            setlength(MapSectionData[m].EVList[l].indicecount,ic);
            setlength(MapSectionData[m].EVList[l].Textureid,ic);
            setlength(MapSectionData[m].EVList[l].indiceAlpha,ic2);
            setlength(MapSectionData[m].EVList[l].indiceAlphacount,ic2);
            setlength(MapSectionData[m].EVList[l].TextureidAlpha,ic2);

            for f:=0 to ic-1 do begin  //load eatch of them (eatch one make an item or object)
          
            fileseek(y,c,0);  //seek to the entry
            inc(c,20);        //prepare for next entry
            fileread(y,q,4);
            fileread(y,o,4);
            fileread(y,e,4);  //get the offset
            fileread(y,k,4);  //get the amount of index
            fileseek(y,e,0);  //seek to it
            setlength(MapSectionData[m].EVList[l].indice[f],k); //reserve teh memory
            fileread(y,MapSectionData[m].EVList[l].indice[f][0],k*2); //read them all
            MapSectionData[m].EVList[l].indicecount[f]:=k;
            //read the texture number
            if o <> 0 then begin
            if o = 4 then inc(q,16);
            fileseek(y,q+4,0);
            fileread(y,MapSectionData[m].EVList[l].textureid[f],4);
            end else if f>0 then MapSectionData[m].EVList[l].textureid[f]:=MapSectionData[m].EVList[l].textureid[f-1] //last used texture
                else MapSectionData[m].EVList[l].textureid[f]:=-1; //if no texture then set 0 in case

            end;

            for f:=0 to ic2-1 do begin  //load eatch of them (eatch one make an item or object)
            fileseek(y,c2,0);  //seek to the entry
            inc(c2,20);        //prepare for next entry
            fileread(y,q,4);
            fileread(y,o,4);
            fileread(y,e,4);  //get the offset
            fileread(y,k,4);  //get the amount of index
            fileseek(y,e,0);  //seek to it
            setlength(MapSectionData[m].EVList[l].indiceAlpha[f],k); //reserve teh memory
            fileread(y,MapSectionData[m].EVList[l].indiceAlpha[f][0],k*2); //read them all
            MapSectionData[m].EVList[l].indiceAlphacount[f]:=k;
            //read the texture number
            if o <> 0 then begin
            if o = 4 then inc(q,20)
            else inc(q,4);
            fileseek(y,q,0);
            fileread(y,MapSectionData[m].EVList[l].textureidAlpha[f],4);
            end else if f>0 then MapSectionData[m].EVList[l].textureidAlpha[f]:=MapSectionData[m].EVList[l].textureidAlpha[f-1]
                else MapSectionData[m].EVList[l].textureidAlpha[f]:=-1;
            end;

            fileseek(y,r+4,0);  //final pointer to the header, seek to it
            fileread(y,r,4); //data offset
            fileread(y,c,4); //size of 1 vertex
            fileread(y,MapSectionData[m].EVListCount[l],4); //amount of vertex
            r:=fileseek(y,r,0);  //load the vertex list
            //reserve memory
            setlength(MapSectionData[m].EVList[l].data,MapSectionData[m].EVListCount[l]);

            if c = $10 then begin
                //here a XYZ + Difuse format
                data.tu:=0;
                data.tv:=0;
                for o:=0 to MapSectionData[m].EVListCount[l]-1 do begin
                    //read and convert to a custom format and adjust the x,y,z for the area
                    fileread(y,data,$10);
                    MapSectionData[m].EVList[l].data[o]:=adjustvertexB(makemyvertex2(data),m,l);
                end;
            end else
            if c = $18 then begin
                //here a XYZ + Difuse + TEX1
                for o:=0 to MapSectionData[m].EVListCount[l]-1 do begin
                    //read and convert to a custom format and adjust the x,y,z for the area
                    fileread(y,data,$18);
                    MapSectionData[m].EVList[l].data[o]:=adjustvertexB(makemyvertex2(data),m,l);
                end;
            end else if c = $1c then begin
                //Same as my Custom format but no tex. XYZ + XYZ_NORMAL + Diffuse
                for o:=0 to MapSectionData[m].EVListCount[l]-1 do begin
                    //read and adjust the x,y,z for the area
                    fileread(y,MapSectionData[m].EVList[l].data[o],$1c);
                    MapSectionData[m].EVList[l].data[o].tu:=0;
                    MapSectionData[m].EVList[l].data[o].tv:=0;
                    MapSectionData[m].EVList[l].data[o]:=adjustvertexB(MapSectionData[m].EVList[l].data[o],m,l);
                end;
            end else if c = $24 then begin
                //Same as my Custom format XYZ + XYZ_NORMAL + Diffuse + TEX1
                for o:=0 to MapSectionData[m].EVListCount[l]-1 do begin
                    //read and adjust the x,y,z for the area
                    fileread(y,MapSectionData[m].EVList[l].data[o],$24);
                    MapSectionData[m].EVList[l].data[o]:=adjustvertexB(MapSectionData[m].EVList[l].data[o],m,l);
                end;
            end else begin
                  MessageDlg('Unknow Vertex format '+inttohex(c,4)+' at '+inttohex(r,8), mtInformation,[mbOk], 0);
                exit;
            end;
            inc(vertexcount,MapSectionData[m].EVListCount[l]);
            end;
        end;
    end;
    //here all the map vertex are loaded
    //load the texture list
    fileseek(y,texoff,0);
    fileread(y,r,4); //off
    fileread(y,m,4); //amount
    form1.ListBox1.Items.Clear;
    for l:=0 to m-1 do begin
        fileseek(y,r,0); //seek to pointer
        inc(r,12); //next pointer position
        fileread(y,c,4); //name pointer
        fileseek(y,c,0); //seek to name
        fileread(y,texname[0],128);
        //add to the visual list
        form1.ListBox1.Items.Add(pchar(@texname[0]));
    end;

    LoadTextureFile(copy(s,1,length(s)-8)+'.xvm');
    fileclose(y);
    result:=true;
    end;
    //end of it
    form1.Label5.Caption:=inttostr(MapSectionCount);
    form1.Label6.Caption:=inttostr(blockCount);
    form1.Label7.Caption:=inttostr(vertexCount);
    form1.Label8.Caption:=inttostr(m);

end;

{function MakeD3DVector(x, y, z: TD3DValue): TD3DVector;
begin
  Result.x := x;
  Result.y := y;
  Result.z := z;
end;     }



procedure FrameMovie(Time: Double);
var
  matView, matRotate: TD3DMatrix;
begin
  // Set the view matrix so that the camera is backed out along the z-axis,
  // and looks down on the cube (rotating along the x-axis by -0.5 radians).
  with form1 do begin
  FilLChar(matView, SizeOf(matView), 0);
  matView._11 := 1.0;
  matView._22 :=  cos(-0.5);
  matView._23 :=  sin(-0.5);
  matView._32 := -sin(-0.2);
  matView._33 :=  cos(-0.5);
  matView._43 := 1000.0;
  matView._44 := 1.0;
  g_pd3dDevice.SetTransform( D3DTS_VIEW, matView);

  // Set the world matrix to rotate along the y-axis, in sync with the
  // timekey
  FilLChar(matRotate, SizeOf(matRotate), 0);
  matRotate._11 :=  cos(-Time);
  matRotate._13 :=  sin(Time);
  matRotate._22 :=  1.0;
  matRotate._31 := -sin(Time);
  matRotate._33 :=  cos(Time);
  matRotate._44 :=  1.0;
  g_pd3dDevice.SetTransform( D3DTS_WORLD, matRotate);
  end;
end;

Function ChangeXYZ:boolean;
var vEyePt, vLookatPt, vUpVec: TD3DVector;
  matView: TD3DMatrix;
  matProj: TD3DMatrix;
  px,py,pz:single;
begin
    px:=cos(vr)*3;
    py:=sin(vz)*3;
    pz:=(cos(vz)*sin(vr))*3;

    vEyePt:= D3DXVector3(eyeptx, eyepty,eyeptz);
    vLookatPt:= D3DXVector3(eyeptx+px, eyepty+py, eyeptz+pz);
    vUpVec:= D3DXVector3(0.0, 1.0, 0.0);
    D3DXMatrixLookAtLH(matView, vEyePt, vLookatPt, vUpVec);
    g_pd3dDevice.SetTransform(D3DTS_VIEW, matView);
    //form1.Label10.Caption:=floattostr(pz);
end;

Function RenderMap:boolean;
var r: TD3DRect;
    x,y,l,c,o,p,i:integer;
    ver:PCustomVertexArray;
    mtrl: TD3DMaterial9;
    zref:array[0..2000,0..3] of integer;
begin
    with form1 do begin
    if rotate then
        FrameMovie(mytick/2000);
    inc(mytick,10);
     g_pd3dDevice.Clear(0, nil, D3DCLEAR_TARGET or D3DCLEAR_ZBUFFER , $FF000000, 1.0, 0);


    asm FINIT end;
    if SUCCEEDED(g_pd3dDevice.BeginScene) then begin


    {  Material  }
    FillChar(mtrl, SizeOf(mtrl), 0);
    mtrl.ambient.r := 1;
    mtrl.ambient.g := 1;
    mtrl.ambient.b := 1;
    mtrl.diffuse.r := 1;
    mtrl.diffuse.g := 1;
    mtrl.diffuse.b := 1;
    g_pd3dDevice.SetMaterial( mtrl );

    g_pd3dDevice.SetSamplerState(0, D3DSAMP_MINFILTER,D3DTEXF_LINEAR );
    g_pd3dDevice.SetSamplerState(0, D3DSAMP_MAGFILTER,D3DTEXF_LINEAR );
    g_pd3dDevice.SetSamplerState(0, D3DSAMP_MIPFILTER,D3DTEXF_ANISOTROPIC );


    //mirror texture on x and y
    //this is needed for pso
    g_pd3dDevice.SetSamplerState(0,D3DSAMP_ADDRESSU,D3DTADDRESS_MIRROR);
    g_pd3dDevice.SetSamplerState(0,D3DSAMP_ADDRESSV,D3DTADDRESS_MIRROR);



    g_pd3dDevice.SetTextureStageState(0,D3DTSS_ALPHAARG1,D3DTA_DIFFUSE);
    g_pd3dDevice.SetTextureStageState( 0, D3DTSS_ALPHAOP, D3DTOP_SELECTARG1  );



    for l:=0 to MapSectionCount-1 do begin //proced eatch area
    for y:=0 to MapSection[l].VertexA_Count-1 do begin   //eatch block of vertex
    for o:=0 to MapSectionData[l].VList[y].indicecountcount-1 do begin   //eatch group of index


    //this way to render should be slower but doesnt reboot the pc on error,
    //i didnt see any speed diference so i use that one for test
    //manualy aling the indexed vertex
    if FAILED(g_pVB.Lock(0, MapSectionData[l].VList[y].indicecount[o]*$24, pointer(ver), 0))
    then Exit;
    for c:=0 to MapSectionData[l].VList[y].indicecount[o]-1 do
        move(MapSectionData[l].VList[y].data[MapSectionData[l].VList[y].indice[o][c]],ver[c],$24);

    g_pVB.Unlock();

    g_pd3dDevice.SetTexture( 0, tex[MapSectionData[l].VList[y].textureid[o]] );


    g_pd3dDevice.SetStreamSource(0, g_pVB, 0, SizeOf(TCustomVertex2));
    g_pd3dDevice.SetFVF(D3DFVF_CUSTOMVERTEX);
    g_pd3dDevice.DrawPrimitive(D3DPT_TRIANGLEstrip, 0, MapSectionData[l].VList[y].indicecount[o]-2);


    end;
    end;
    end;

     //groupe b (normaly are the animated vertex, with rotation and other thing....
     //i belive the movement data offset is set right after the offset in the EVList

    for l:=0 to MapSectionCount-1 do begin //proced eatch area
    for y:=0 to MapSection[l].VertexB_Count-1 do begin   //eatch block of vertex
    for o:=0 to MapSectionData[l].EVList[y].indicecountcount-1 do begin   //eatch group of index

    //this way to render should be slower but doesnt reboot the pc on error,
    //i didnt see any speed diference so i use that one for test
    //manualy aling the indexed vertex
    if FAILED(g_pVB.Lock(0, MapSectionData[l].EVList[y].indicecount[o]*$24, pointer(ver), 0))
    then Exit;
    for c:=0 to MapSectionData[l].EVList[y].indicecount[o]-1 do
        move(MapSectionData[l].EVList[y].data[MapSectionData[l].EVList[y].indice[o][c]],ver[c],$24);

    g_pVB.Unlock();

    g_pd3dDevice.SetTexture( 0, tex[MapSectionData[l].EVList[y].textureid[o]] );


    g_pd3dDevice.SetStreamSource(0, g_pVB, 0, SizeOf(TCustomVertex2));
    g_pd3dDevice.SetFVF(D3DFVF_CUSTOMVERTEX);
    g_pd3dDevice.DrawPrimitive(D3DPT_TRIANGLEstrip, 0, MapSectionData[l].EVList[y].indicecount[o]-2);


    end;
    end;
    end;


    //alpha chanel now
    //sort by distance
    p:=0;
    for l:=0 to MapSectionCount-1 do  //proced eatch area
    for y:=0 to MapSection[l].VertexA_Count-1 do   //eatch block of vertex
        for i:=0 to MapSectionData[l].VList[y].indicealphacountcount-1 do begin   //if have alpha
            //now get the distance
            o:=round(sqrt(sqr(MapSectionData[l].VList[y].data[MapSectionData[l].VList[y].indiceAlpha[i,0]].px-eyeptx)+sqr(MapSectionData[l].VList[y].data[MapSectionData[l].VList[y].indiceAlpha[i,0]].py-eyeptz)));
            x:=0;
            if p>0 then
            for x:=0 to p-1 do
                if zref[x,3]<o then break;
            for c:=p downto x+1 do begin
                zref[c,3]:=zref[c-1,3];
                zref[c,2]:=zref[c-1,2];
                zref[c,1]:=zref[c-1,1];
                zref[c,0]:=zref[c-1,0];
            end;
            zref[x,0]:=l;
            zref[x,1]:=y;
            zref[x,2]:=i;
            zref[x,3]:=o;
            inc(p);
        end;



    for x:=0 to p-1 do begin
    l:=zref[x,0];
    y:=zref[x,1];
    o:=zref[x,2];

    //same as beafor
    if FAILED(g_pVB.Lock(0, MapSectionData[l].VList[y].indicealphacount[o]*$24, pointer(ver), 0))
    then Exit;
    for c:=0 to MapSectionData[l].VList[y].indicealphacount[o]-1 do
        move(MapSectionData[l].VList[y].data[MapSectionData[l].VList[y].indicealpha[o][c]],ver[c],$24);

    g_pVB.Unlock();


    if MapSectionData[l].VList[y].textureidalpha[o] > -1 then begin
    g_pd3dDevice.SetTexture( 0, tex[MapSectionData[l].VList[y].textureidalpha[o]] );
    if textype[MapSectionData[l].VList[y].textureidalpha[o]] < 2 then
        g_pd3dDevice.SetTextureStageState(0,D3DTSS_ALPHAARG1,D3DTA_DIFFUSE) //alpha from texture
    else begin
        g_pd3dDevice.SetTextureStageState(0,D3DTSS_ALPHAARG1,D3DTA_TEXTURE); //alpha from texture
    end;
    end else begin
        g_pd3dDevice.SetTexture( 0, nil );
        g_pd3dDevice.SetTextureStageState(0,D3DTSS_ALPHAARG1,D3DTA_DIFFUSE); //alpha from texture
    end;

    g_pd3dDevice.SetStreamSource(0, g_pVB, 0, SizeOf(TCustomVertex2));
    g_pd3dDevice.SetFVF(D3DFVF_CUSTOMVERTEX);
    g_pd3dDevice.DrawPrimitive(D3DPT_TRIANGLEstrip, 0, MapSectionData[l].VList[y].indicealphacount[o]-2);

    end;



    //alpha from group B
    p:=0;
    for l:=0 to MapSectionCount-1 do  //proced eatch area
    for y:=0 to MapSection[l].VertexB_Count-1 do   //eatch block of vertex
        for i:=0 to MapSectionData[l].EVList[y].indicealphacountcount-1 do begin   //if have alpha
            //now get the distance
            o:=round(sqrt(sqr(MapSectionData[l].EVList[y].data[MapSectionData[l].EVList[y].indiceAlpha[i,0]].px-eyeptx)+sqr(MapSectionData[l].EVList[y].data[MapSectionData[l].EVList[y].indiceAlpha[i,0]].py-eyeptz)));
            x:=0;
            if p>0 then
            for x:=0 to p-1 do
                if zref[x,3]<o then break;
            for c:=p downto x+1 do begin
                zref[c,3]:=zref[c-1,3];
                zref[c,2]:=zref[c-1,2];
                zref[c,1]:=zref[c-1,1];
                zref[c,0]:=zref[c-1,0];
            end;
            zref[x,0]:=l;
            zref[x,1]:=y;
            zref[x,2]:=i;
            zref[x,3]:=o;
            inc(p);
        end;



    for x:=0 to p-1 do begin
    l:=zref[x,0];
    y:=zref[x,1];
    o:=zref[x,2];

    //same as beafor
    if FAILED(g_pVB.Lock(0, MapSectionData[l].EVList[y].indicealphacount[o]*$24, pointer(ver), 0))
    then Exit;
    for c:=0 to MapSectionData[l].EVList[y].indicealphacount[o]-1 do
        move(MapSectionData[l].EVList[y].data[MapSectionData[l].EVList[y].indicealpha[o][c]],ver[c],$24);

    g_pVB.Unlock();


    if MapSectionData[l].EVList[y].textureidalpha[o] > -1 then begin
    g_pd3dDevice.SetTexture( 0, tex[MapSectionData[l].EVList[y].textureidalpha[o]] );
    if textype[MapSectionData[l].EVList[y].textureidalpha[o]] < 2 then
        g_pd3dDevice.SetTextureStageState(0,D3DTSS_ALPHAARG1,D3DTA_DIFFUSE) //alpha from texture
    else begin
        g_pd3dDevice.SetTextureStageState(0,D3DTSS_ALPHAARG1,D3DTA_TEXTURE); //alpha from texture
    end;
    end else begin
        g_pd3dDevice.SetTexture( 0, nil );
        g_pd3dDevice.SetTextureStageState(0,D3DTSS_ALPHAARG1,D3DTA_DIFFUSE); //alpha from texture
    end;

    g_pd3dDevice.SetStreamSource(0, g_pVB, 0, SizeOf(TCustomVertex2));
    g_pd3dDevice.SetFVF(D3DFVF_CUSTOMVERTEX);
    g_pd3dDevice.DrawPrimitive(D3DPT_TRIANGLEstrip, 0, MapSectionData[l].EVList[y].indicealphacount[o]-2);

    end;
            
    g_pd3dDevice.EndScene;
    asm FINIT end;

    //label9.Caption:=inttostr(dxtimer1.FrameRate);

    g_pd3dDevice.Present(nil, nil, 0, nil);
    end;
    end;
end;

procedure TForm1.Button1Click(Sender: TObject);
begin
    timer1.Enabled:=MapOpen('map_lobby_01n.rel');
    eyeptx:=0;
    eyepty:=20;
    eyeptz:=0;
    changeXYZ;
end;



procedure TForm1.FormShow(Sender: TObject);
begin
    if tag =0 then begin
        tag:=1;
        InitD3D(panel1.Handle);
    end;
end;

procedure TForm1.CheckBox1Click(Sender: TObject);
begin
    Rotate:=CheckBox1.checked;
    if not rotate then changeXYZ;
end;

procedure TForm1.Panel1MouseMove(Sender: TObject; Shift: TShiftState; X,
  Y: Integer);
begin
    if shift = [ssleft] then begin
        vz:=vz+((lmy-y)/120);
        if vz > 1.5 then vz:=1.5;
        if vz < -1.5 then vz:=-1.5;
        vr:=vr+((lmx-x)/120);
        lmx:=x;
        lmy:=y;
        changexyz;
    end;
end;

procedure TForm1.Panel1MouseDown(Sender: TObject; Button: TMouseButton;
  Shift: TShiftState; X, Y: Integer);
begin
    lmx:=x;
    lmy:=y;
end;

function GoForward:boolean;
var px,py,pz:single;
begin
    px:=cos(vr);
    py:=sin(vz);
    pz:=(cos(vz))*sin(vr);
    eyeptx:=eyeptx+px;
    eyepty:=eyepty+py;
    eyeptz:=eyeptz+pz;
    changexyz;
end;

function GoBackward:boolean;
var px,py,pz:single;
begin
    px:=cos(vr);
    py:=sin(vz);
    pz:=(cos(vz))*sin(vr);
    eyeptx:=eyeptx-px;
    eyepty:=eyepty-py;
    eyeptz:=eyeptz-pz;
    changexyz;
end;

procedure TForm1.Timer1Timer(Sender: TObject);
begin
    RenderMap;
    inc(fps);
    dxinput1.Keyboard.Update;
    if DXInput1.Keyboard.Keys[Ord('Q')] then GoForward;
    if DXInput1.Keyboard.Keys[Ord('A')] then GoBackward;
end;

procedure TForm1.Timer2Timer(Sender: TObject);
begin
    label9.Caption:=inttostr(fps);
    fps:=0;
    changexyz;
end;

procedure TForm1.Button2Click(Sender: TObject);
begin
    timer1.Enabled:=MapOpen('map_city00_00n.rel');
    eyeptx:=0;
    eyepty:=20;
    eyeptz:=0;
    changeXYZ;
end;

procedure TForm1.Button3Click(Sender: TObject);
begin
    timer1.Enabled:=MapOpen('map_forest01n.rel');
    eyeptx:=0;
    eyepty:=20;
    eyeptz:=0;
    changeXYZ;
end;

procedure TForm1.Button4Click(Sender: TObject);
begin
    timer1.Enabled:=MapOpen('map_jungle02_00n.rel');
    eyeptx:=0;
    eyepty:=20;
    eyeptz:=0;
    changeXYZ;
end;

procedure TForm1.Button5Click(Sender: TObject);
begin
    timer1.Enabled:=MapOpen('map_ancient03_00n.rel');
    eyeptx:=0;
    eyepty:=20;
    eyeptz:=0;
    changeXYZ;
end;

end.
