/*
                .PRS compression class written by Lightning.
              For use with modern Sega games' compressed data.

   Many thanks go to Nemesis; without him, this wouldn't have been possible.
              His .PRS program was a huge help in this project.
  In fact, in many ways, the decompression aspects of this program mirror his.
*/

// 11/12/2005 - Brick wall on progress on compress() between 10/19/2005 and now
// 10/18/2005 - Implemented a saucerful of subroutines, mainly for compress()
// 10/15/2005 - Added delete_this_buffer() functions for garbage collection
// 10/14/2005 - Simplified decompression code
// 10/12/2005 - Made some minor revisions for efficiency
// 10/03/2005 - First private release

#ifndef __PRS__
#define __PRS__

#include <fstream>

typedef unsigned char byte;
typedef unsigned short int word;
typedef unsigned long int dword;

#define PRS_MODE 	 byte
#define PRS_MODE_STORAGE	0x1
#define PRS_MODE_OFFSETCPY	0x2
#define PRS_MODE_EXTENDCPY	0x4
#define PRS_MODE_ALIGNED	0x8
#define PRS_MODE_DEFAULT	0x1 // replace with 0xF when compression works

#define min(a, b) ((a) < (b) ? (a) : (b))

class prs
{
private:

	byte *cmp_buffer;
	byte *dec_buffer;
	dword cmp_size, cmp_index;
	dword dec_size, dec_index;

	bool tag_reposition;
	byte tag_byte;
	byte tag_bits;
	dword tag_index;

	byte min_length;
	dword offset_count;
	word offset;

	bool compressed;
	bool decompressed;
	byte compression;
	byte decompression;
public:
	prs(void);
	~prs(void);
	void reset(void);
	void delete_cmp_buffer(void);
	void delete_dec_buffer(void);
private:
	byte cmp_get_byte(void);
	byte dec_get_byte(void);
	void cmp_put_byte(byte value);
	void dec_put_byte(byte value);
public:
	bool decompress(PRS_MODE mode);
	bool decompress(void);
private:
	bool dec_get_bit(void);
	bool dec_extended_copy(void);
	bool dec_offset_copy(void);
	bool dec_copy(void);
public:
	bool compress(PRS_MODE mode);
	bool compress(void);
private:
	void cmp_put_bit(bool bit);
	PRS_MODE cmp_find_best(PRS_MODE mode);
public:
	bool read_cmp_file(const char *filename);
	bool read_dec_file(const char *filename);
	void read_cmp_buffer(const byte *new_buffer, const dword new_size);
	void read_dec_buffer(const byte *new_buffer, const dword new_size);
	bool write_cmp_file(const char *filename);
	bool write_dec_file(const char *filename);
	void write_cmp_buffer(byte *new_buffer);
	void write_dec_buffer(byte *new_buffer);
	dword get_cmp_size(void);
	dword get_dec_size(void);
};





prs::prs(void)
{
	reset();
	delete_cmp_buffer();
	delete_dec_buffer();
}
prs::~prs(void)
{
	delete_cmp_buffer();
	delete_dec_buffer();
}

void prs::reset(void)
{
	cmp_index = 0;
	dec_index = 0;
	tag_reposition = true;
	tag_byte = 0;
	tag_bits = 8;
	tag_index = 0;
	min_length = 2;
	offset_count = 0;
	offset = 0;
	compression = PRS_MODE_DEFAULT;
	decompression = PRS_MODE_DEFAULT;
}

void prs::delete_cmp_buffer(void)
{
	cmp_index = 0;
	if(!cmp_buffer)
  delete(cmp_buffer);
	cmp_size = 0;
	compressed = false;
}
void prs::delete_dec_buffer(void)
{
	dec_index = 0;
	if(!dec_buffer)
  delete(dec_buffer);
	dec_size = 0;
	decompressed = false;
}

byte prs::cmp_get_byte(void)
{
	return(cmp_buffer[cmp_index++]);
}
byte prs::dec_get_byte(void)
{
	return(dec_buffer[dec_index++]);
}
void prs::cmp_put_byte(byte value)
{
	cmp_buffer[cmp_index++] = value;
}
void prs::dec_put_byte(byte value)
{
	dec_buffer[dec_index++] = value;
}

bool prs::decompress(PRS_MODE mode)
{
	if(decompressed && decompression == mode)
  return(decompressed);

	reset();
	if(!cmp_size || !cmp_buffer)
  return(false);

	decompression = mode;

	delete_dec_buffer();
	dec_buffer = new byte[dec_size = cmp_size << 8];
	memset(dec_buffer, 0x00, dec_size);

	tag_byte = cmp_get_byte();
	while(cmp_index < cmp_size - 1)
	{
  if(dec_get_bit() && mode & PRS_MODE_STORAGE)
  {
 	 dec_put_byte(cmp_get_byte());
  }
  else
  {
 	 if(dec_get_bit() && mode & PRS_MODE_EXTENDCPY)
 	 {
    if(!dec_extended_copy())
    {
   	 dec_size = dec_index;
   	 return(decompressed = false);
    }
 	 }
 	 else if(mode & PRS_MODE_OFFSETCPY)
 	 {
    if(!dec_offset_copy())
    {
   	 dec_size = dec_index;
   	 return(decompressed = false);
    }
 	 }
  }
	}

	dec_size = dec_index;

	return(decompressed = true);
}
bool prs::decompress(void)
{
	if(!decompressed)
  return(decompress(PRS_MODE_DEFAULT));
	return(decompressed);
}

bool prs::dec_get_bit(void)
{
	bool bit;

	if(!tag_bits)
	{
  tag_byte = cmp_get_byte();
  tag_bits = 8;
	}
	tag_bits--;
	bit = tag_byte & 0x01;
	tag_byte >>= 1;

	return(bit);
}

bool prs::dec_extended_copy(void)
{
	byte pair[2] = { cmp_get_byte(), cmp_get_byte() };

	if(!(pair[0] || pair[1]))
  return(true);

	offset_count = pair[0] & 0x07 ? (pair[0] & 0x07) + min_length : cmp_get_byte() + 1;
	offset = 0xE000 | (pair[1] << 5) | (pair[0] >> 3);

	return(dec_copy());
}
bool prs::dec_offset_copy(void)
{
	offset_count = (((byte)dec_get_bit() << 1) | (byte)dec_get_bit()) + min_length;
	offset = 0xFF00 | cmp_get_byte();

	return(dec_copy());
}
bool prs::dec_copy(void)
{
	if(dec_index < (offset = ~offset + 1))
  return(false);

	while(offset_count--)
  dec_buffer[dec_index] = dec_buffer[dec_index++ - offset];

	return(true);
}

bool prs::compress(PRS_MODE mode)
{
	if(compressed && compression == mode)
  return(compressed);

	reset();
	if(!dec_size || !dec_buffer)
  return(false);

	compression = mode;

	delete_cmp_buffer();
	cmp_buffer = new byte[cmp_size = dec_size << 2];
	memset(cmp_buffer, 0x00, cmp_size);

	tag_index = 0;
	cmp_index = 1;
	tag_reposition = false;

	while(dec_index < dec_size)
	{
// PROBABLY SOMETHING WRONG HERE
  switch(cmp_find_best(mode))
  {
  case PRS_MODE_EXTENDCPY:
 	 cmp_put_bit(0);
 	 cmp_put_bit(1);

 	 byte pair[2];
 	 pair[0] = offset << 3;
 	 pair[1] = offset >> 5;

 	 if(offset_count < 8)
    pair[0] |= offset_count;

 	 cmp_put_byte(pair[0]);
 	 cmp_put_byte(pair[1]);

 	 if(offset_count >= 8)
    cmp_put_byte(offset_count - 1);

 	 dec_index += offset_count;
 	 break;
  case PRS_MODE_OFFSETCPY:
 	 cmp_put_bit(0);
 	 cmp_put_bit(0);

 	 cmp_put_bit(!!((offset_count - min_length) & 2));
 	 cmp_put_bit(!!((offset_count - min_length) & 1));
 	 cmp_put_byte(offset + 1);

 	 dec_index += offset_count;
 	 break;
  default:
 	 cmp_put_bit(1);
 	 cmp_put_byte(dec_get_byte());
 	 break;
  }

  if(tag_reposition)
  {
 	 tag_index = cmp_index++;
 	 tag_reposition = false;
  }
	}

	while(!tag_reposition)
	{
  cmp_put_bit(0);
  cmp_put_bit(1);
  cmp_put_byte(0);
	}

	if(mode & PRS_MODE_ALIGNED)
  while(cmp_index % 4)
 	 cmp_put_byte(0);

	cmp_size = cmp_index;
	return(compressed = true);
}
bool prs::compress(void)
{
	if(!compressed)
  return(compress(PRS_MODE_DEFAULT));
	return(compressed);
}

void prs::cmp_put_bit(bool bit)
{
	tag_bits--;
	tag_byte |= (byte)bit << 7;
	if(!tag_bits)
	{
  cmp_buffer[tag_index] = tag_byte;
  tag_byte = 0;
  tag_bits = 8;
  tag_reposition = true;
	}
	tag_byte >>= 1;
}

PRS_MODE prs::cmp_find_best(PRS_MODE mode)
{
	if((mode & PRS_MODE_EXTENDCPY) || (mode & PRS_MODE_OFFSETCPY))
	{
// PROBABLY SOMETHING WRONG HERE
  if(dec_index > min_length)
  {
 	 dword max_index = dec_index;
 	 dword max_count = min_length;
 	 bool found = false;

 	 for(offset = min(dec_index, (mode & PRS_MODE_EXTENDCPY) ? 0x2000 : 0x100);
 	 offset;
 	 offset--)
 	 {
    for(offset_count = 0;
    dec_index - offset + offset_count < dec_index - min_length
    && dec_index + offset_count < dec_size
    && offset_count < ((mode & PRS_MODE_EXTENDCPY) ? 0x100 : min_length + 4);
    offset_count++)
    {
   	 if(dec_buffer[dec_index + offset_count] != dec_buffer[dec_index - offset + offset_count])
   	 {
      if(offset_count >= max_count)
      {
     	 max_index = offset;
     	 max_count = offset_count;
     	 found = true;
      }
      break;
   	 }
    }
 	 }

 	 if(found)
 	 {
    offset = max_index;
    offset_count = max_count - 1;

    if(offset < 0x100 && offset_count < min_length + 4)
    {
   	 offset ^= 0xFF;
   	 return(PRS_MODE_OFFSETCPY);
    }
    else
    {
   	 offset ^= 0xFFFF;
   	 return(PRS_MODE_EXTENDCPY);
    }
 	 }
  }
	}

	return(mode & PRS_MODE_STORAGE);
}

bool prs::read_cmp_file(const char *filename)
{
	std::fstream cmp_file;

	cmp_file.open(filename, std::ios::in | std::ios::binary);
	if(!cmp_file.good())
  return(false);

	delete_cmp_buffer();

	cmp_file.seekg(0, std::ios::end);
	cmp_size = cmp_file.tellg();
	cmp_file.seekg(0, std::ios::beg);

	cmp_buffer = new byte[cmp_size];
	cmp_file.read((char *)cmp_buffer, cmp_size);
	cmp_file.close();

	decompressed = false;
	return(compressed = true);
}
bool prs::read_dec_file(const char *filename)
{
	std::fstream dec_file;

	dec_file.open(filename, std::ios::in | std::ios::binary);
	if(!dec_file.good())
  return(false);

	delete_dec_buffer();

	dec_file.seekg(0, std::ios::end);
	dec_size = dec_file.tellg();
	dec_file.seekg(0, std::ios::beg);

	dec_buffer = new byte[dec_size];
	dec_file.read((char *)dec_buffer, dec_size);
	dec_file.close();

	compressed = false;
	return(decompressed = true);
}

void prs::read_cmp_buffer(const byte *new_buffer, const dword new_size)
{
	delete_cmp_buffer();
	cmp_buffer = new byte[cmp_size = new_size];
	memcpy(cmp_buffer, new_buffer, new_size);

	cmp_index = 0;
	compressed = true;
	decompressed = false;
}
void prs::read_dec_buffer(const byte *new_buffer, const dword new_size)
{
	delete_dec_buffer();
	dec_buffer = new byte[dec_size = new_size];
	memcpy(dec_buffer, new_buffer, new_size);

	dec_index = 0;
	compressed = false;
	decompressed = true;
}

bool prs::write_cmp_file(const char *filename)
{
	std::fstream cmp_file;

	if(!compress())
  return(false);

	cmp_file.open(filename, std::ios::out | std::ios::binary);
	if(!cmp_file.good())
  return(false);

	cmp_file.write((char *)cmp_buffer, cmp_size);
	cmp_file.close();
	return(true);
}
bool prs::write_dec_file(const char *filename)
{
	std::fstream dec_file;

	if(!decompress())
  return(false);

	dec_file.open(filename, std::ios::out | std::ios::binary);
	if(!dec_file.good())
  return(false);

	dec_file.write((char *)dec_buffer, dec_size);
	dec_file.close();

	return(true);
}

void prs::write_cmp_buffer(byte *new_buffer)
{
	if(compress())
  memcpy(new_buffer, cmp_buffer, cmp_size);
}
void prs::write_dec_buffer(byte *new_buffer)
{
	if(decompress())
  memcpy(new_buffer, dec_buffer, dec_size);
}

dword prs::get_cmp_size(void)
{
	if(compress())
  return(cmp_size);
	return(0);
}
dword prs::get_dec_size(void)
{
	if(decompress())
  return(dec_size);
	return(0);
}

#endif // __PRS__
