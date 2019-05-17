GOFMT=gofmt
GC=go build 
VERSION := $(shell git describe --abbrev=4 --always --tags)
BUILD_DSP_SERVER_PAR =
BUILD_DSP_CLIENT_PAR =

SRC_FILES = $(shell git ls-files | grep -e .go$ | grep -v _test.go)

all: client

client:
	-rm resources/*/edge
	$(GC) $(BUILD_DSP_CLIENT_PAR) -o resources/mac/edge ~/go/src/github.com/saveio/edge/bin/dsp/main.go
	
do-cross: w-dsp l-dsp d-dsp

w-dsp:
	CGO_ENABLED=1 CC=x86_64-w64-mingw32-gcc CXX=x86_64-w64-mingw32-g++ GOOS=windows GOARCH=amd64 go build -x -v -ldflags "-s -w" -o resources/win/edge.exe ~/go/src/github.com/saveio/edge/bin/dsp/main.go

l-dsp:

d-dsp:
	CGO_ENABLED=1 GOOS=darwin GOARCH=amd64 $(GC) $(BUILD_DSP_CLIENT_PAR) -o resources/mac/edge ~/go/src/github.com/saveio/edge/bin/dsp/main.go

format:
	$(GOFMT) -w main.go

clean:
	rm -rf build/*.dmg build/*.exe

