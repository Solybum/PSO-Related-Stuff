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

  //open source file
  FILE * src;
  src = fopen(srcname.c_str(), "rb");
  if (!src) {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "could not open source file")));
    return;
  }
  fseek(src, 0, SEEK_END);
  size_src = ftell(src);
  void* srcdata = malloc(size_src);
  if (!srcdata){
      fclose(src);
      isolate->ThrowException(Exception::TypeError(
          String::NewFromUtf8(isolate, "not enough free memory to load source data")));
      return;
  }

  //close file handlers
  fclose(src);

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
