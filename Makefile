GOFMT=gofmt
GC=go build 
VERSION := $(shell git describe --abbrev=4 --always --tags)
BUILD_DSP_SERVER_PAR =
BUILD_DSP_CLIENT_PAR =

SRC_FILES = $(shell git ls-files | grep -e .go$ | grep -v _test.go)

all: client

client:
	-rm resources/mac/dsp
	$(GC) $(BUILD_DSP_CLIENT_PAR) -o resources/mac/dsp ~/go/src/github.com/oniio/oniClients/bin/dsp/main.go
	
do-cross: w-dsp l-dsp d-dsp

w-dsp:

l-dsp:

d-dsp:
	CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 $(GC) $(BUILD_DSP_CLIENT_PAR) -o resources/mac/dsp ~/go/src/github.com/oniio/oniClients/bin/dsp/main.go

format:
	$(GOFMT) -w main.go

clean:
	rm -rf *.8 *.o *.out *.6 *exe

