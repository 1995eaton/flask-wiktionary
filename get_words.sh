#!/bin/sh

url="http://toolserver.org/~enwikt/definitions/enwikt-defs-latest-en.tsv.gz"

wget $url -vo wiki.tsv.gz
