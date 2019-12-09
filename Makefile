GOFMT=gofmt
GC=go build --tags "json1"
EDGE_GITCOMMIT=$(shell cd ~/go/src/github.com/saveio/edge && git log -1 --pretty=format:"%H")
PYLONS_GITCOMMIT=$(shell cd ~/go/src/github.com/saveio/pylons && git log -1 --pretty=format:"%H")
CARRIER_GITCOMMIT=$(shell cd ~/go/src/github.com/saveio/carrier && git log -1 --pretty=format:"%H")
MAX_GITCOMMIT=$(shell cd ~/go/src/github.com/saveio/max && git log -1 --pretty=format:"%H")
DSP_GITCOMMIT=$(shell cd ~/go/src/github.com/saveio/dsp-go-sdk && git log -1 --pretty=format:"%H")

BUILD_EDGE_PAR =-v -ldflags "-s -w -X github.com/saveio/edge/dsp.Version=$(EDGE_GITCOMMIT) -X github.com/saveio/pylons.Version=${PYLONS_GITCOMMIT} -X github.com/saveio/carrier/network.Version=${CARRIER_GITCOMMIT} -X github.com/saveio/max/max.Version=${MAX_GITCOMMIT} -X github.com/saveio/dsp-go-sdk/dsp.Version=${DSP_GITCOMMIT}"

all: client

client:
	-rm resources/*/edge
	$(GC) $(BUILD_EDGE_PAR) -o resources/mac/edge ~/go/src/github.com/saveio/edge/bin/edge/main.go

do-cross: w-dsp l-dsp d-dsp

w-dsp:
	CGO_ENABLED=1 CC=x86_64-w64-mingw32-gcc CXX=x86_64-w64-mingw32-g++ GOOS=windows GOARCH=amd64 ${GC} ${BUILD_EDGE_PAR} -o resources/win/edge-windows-amd64.exe ~/go/src/github.com/saveio/edge/bin/edge/main.go

l-dsp:
	CGO_ENABLED=1 GOOS=linux GOARCH=amd64 $(GC) ${BUILD_EDGE_PAR}  -o resources/mac/edge-linux-amd64 ~/go/src/github.com/saveio/edge/bin/edge/main.go

d-dsp:
	CGO_ENABLED=1 GOOS=darwin GOARCH=amd64 $(GC) ${BUILD_EDGE_PAR}  -o resources/mac/edge-darwin-amd64 ~/go/src/github.com/saveio/edge/bin/edge/main.go

format:
	$(GOFMT) -w main.go

clean:
	rm -rf build/*.dmg build/*.exe
