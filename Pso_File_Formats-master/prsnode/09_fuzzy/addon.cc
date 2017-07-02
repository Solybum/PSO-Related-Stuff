#include <node.h>
#include <stdio.h>
#include <iostream>
#include <cstring>
#include <fstream>
#include "prs.hpp"

using namespace v8;

void Add(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  unsigned long size_src,size_dest,bytesread;

  //check number of arguments
  if (args.Length() != 1) {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Wrong number of arguments")));
    return;
  }

  //Convert arg to string
  v8::String::Utf8Value str(args[0]->ToString());
  std::string srcname = std::string(*str);

  //destfile name
  std::string destname = srcname.substr(0,srcname.size()-4);

  //open and read source file
  FILE *src;
  src = fopen(srcname.c_str(), "rb");
  if (!src) {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "could not open source file")));
    return;
  }
  fseek(src, 0, SEEK_END);
  size_src = ftell(src);
  fseek(src, 0, SEEK_SET);
  void* srcdata = malloc(size_src);
  if (!srcdata){
      fclose(src);
      isolate->ThrowException(Exception::TypeError(
          String::NewFromUtf8(isolate, "not enough free memory to load source data")));
      return;
  }
  bytesread = fread(srcdata,size_src,1,src);
  fclose(src);

  if (!bytesread){
      fclose(src);
      isolate->ThrowException(Exception::TypeError(
          String::NewFromUtf8(isolate, "could not read source data")));
      return;
  }

  //create dest file
  void* destdata = malloc(prs_decompress_size(srcdata));
  if (!destdata){
      isolate->ThrowException(Exception::TypeError(
          String::NewFromUtf8(isolate, "not enough free memory to process data")));
      return;
  }

  //Decompress data
  size_dest = prs_decompress(srcdata,destdata);
  printf("Size %d", size_dest);

  //Write data to file
  FILE *dest;
  dest = fopen(destname.c_str(), "wb");
  if (!dest) {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "could not open destination file")));
    return;
  }
  fwrite(destdata, size_dest, 1, dest);
  fclose(dest);

  //unallocate memory
  free(srcdata);
  free(destdata);

  //Handle<Value> return_str = v8::String::New(from.c_str());
  const uint8_t* octets = reinterpret_cast<const uint8_t*>(destname.c_str());
  v8::Local<v8::String> return_val = v8::String::NewFromOneByte(isolate, octets);

  //return value
  args.GetReturnValue().Set(return_val);
}

void Init(Handle<Object> exports) {
  NODE_SET_METHOD(exports, "add", Add);
}

NODE_MODULE(addon, Init)
