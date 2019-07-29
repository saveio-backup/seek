GOFMT=gofmt
GC=go build 
VERSION := $(shell git describe --abbrev=4 --always --tags)
BUILD_DSP_SERVER_PAR =
BUILD_DSP_CLIENT_PAR =
GITCOMMIT=
SRC_FILES = $(shell git ls-files | grep -e .go$ | grep -v _test.go)
EDGE=~/go/src/github.com/saveio/edge

all: client

client:
	-rm resources/*/edge
	$(GC) $(BUILD_DSP_CLIENT_PAR) -o resources/mac/edge ~/go/src/github.com/saveio/edge/bin/edge/main.go

do-cross: w-dsp l-dsp d-dsp

w-dsp:
	$(eval GITCOMMIT=$(shell cd $(EDGE) && git log -1 --pretty=format:"%H"))
	CGO_ENABLED=1 CC=x86_64-w64-mingw32-gcc CXX=x86_64-w64-mingw32-g++ GOOS=windows GOARCH=amd64 go build -x -v -ldflags "-s -w -X github.com/saveio/edge/dsp.GitCommit=$(GITCOMMIT)" -o resources/win/edge.exe ~/go/src/github.com/saveio/edge/bin/edge/main.go

l-dsp:
	$(eval GITCOMMIT=$(shell cd $(EDGE) && git log -1 --pretty=format:"%H"))
d-dsp:
	$(eval GITCOMMIT=$(shell cd $(EDGE) && git log -1 --pretty=format:"%H"))
	CGO_ENABLED=1 GOOS=darwin GOARCH=amd64 $(GC) $(BUILD_DSP_CLIENT_PAR) -x -v -ldflags "-s -w -X github.com/saveio/edge/dsp.GitCommit=$(GITCOMMIT)"  -o resources/mac/edge ~/go/src/github.com/saveio/edge/bin/edge/main.go

format:
	$(GOFMT) -w main.go

clean:
	rm -rf build/*.dmg build/*.exe