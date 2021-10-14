#!/bin/bash

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Not running as root"
    exit
fi

while getopts b:v:o:d: flag
do
    case "${flag}" in
        b) branding=${OPTARG};;
        v) version=${OPTARG};;
        o) outputDir=${OPTARG};;
        d) dataDir=${OPTARG}
    esac
done

if [ -z "$branding" ]; then
    echo "-b for node branding"
    exit
fi

if [ -z "$outputDir" ]; then
    echo "-o for config output directory"
    exit
fi

if [ -z "$dataDir" ]; then
    echo "-d for data directory"
    exit
fi

if [[ -f "./src/$branding.config.ts" ]]; then
    git pull
else
    echo "./src/$branding.config.ts does not exist"
    exit
fi

cp ./src/${branding}.config.ts ./src/config.ts
echo "Running npx ts-node src/index.ts --branding=$branding --version=$version --outputDir=$outputDir --dataDir=$dataDir"
npx ts-node src/index.ts --branding=${branding} --version=${version} --outputDir=${outputDir} --dataDir=${dataDir} && chown -R 1005:1001 ${dest}/${branding}/*
rm ./src/config.ts