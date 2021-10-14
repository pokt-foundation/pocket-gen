#!/bin/bash

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Not running as root"
    exit
fi

while getopts b:v:d: flag
do
    case "${flag}" in
        b) branding=${OPTARG};;
        v) version=${OPTARG};;
        d) dest=${OPTARG}
    esac
done

if [ -z "$branding" ]; then
    echo "-b for node branding"
    exit
fi

if [ -z "$dest" ]; then
    echo "-d for destination directory"
    exit
fi

if [[ -f "./src/$branding.config.ts" ]]; then
    git pull
else
    echo "./src/$branding.config.ts does not exist"
    exit
fi

cp ./src/${branding}.config.ts ./src/config.ts
echo "Running npx ts-node src/index.ts --branding=$branding --version=$version --dest=$dest"
npx ts-node src/index.ts --branding=${branding} --version=${version} --dest=${dest} && chown -R 1005:1001 ${dest}/${branding}/*
rm ./src/config.ts
