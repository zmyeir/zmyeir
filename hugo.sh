#!/usr/bin/sh
_______s () {
hugo server --disableFastRender --environment production --renderToMemory --port 23380
}
_______g () {
hugo --minify --gc
}
_______$*