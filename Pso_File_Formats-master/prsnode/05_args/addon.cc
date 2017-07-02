#include <node.h>
#include <stdio.h>
#include <iostream>
#include <cstring>
#include "prs.hpp"

using namespace v8;

void Add(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  //check number of arguments
  if (args.Length() != 1) {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Wrong number of arguments")));
    return;
  }

  //Convert arg to string
  v8::String::Utf8Value str(args[0]->ToString());
  std::string from = std::string(*str);

  printf("Value is %s\n", from);

  std::string to = "World";
  //Convert string to value
  //Handle<Value> return_str = v8::String::New(from.c_str());
  const uint8_t* octets = reinterpret_cast<const uint8_t*>(to.c_str());
  v8::Local<v8::String> latin1 = v8::String::NewFromOneByte(isolate, octets);

  //return value
  args.GetReturnValue().Set(latin1);
}

void Init(Handle<Object> exports) {
  NODE_SET_METHOD(exports, "add", Add);
}

NODE_MODULE(addon, Init)
