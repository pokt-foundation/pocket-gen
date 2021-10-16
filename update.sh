#!/bin/bash

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Not running as root"
    exit
fi

while getopts b:v:o:d:s:m:i:r:a:l: flag
do
    case "${flag}" in
        b) branding=${OPTARG};;
        v) version=${OPTARG};;
        o) outputDir=${OPTARG};;
        d) dataDir=${OPTARG};;
        s) subdomain=${OPTARG};;
        m) domain=${OPTARG};;
        i) increment=${OPTARG};;
        r) restart=${OPTARG};;
        a) allowIP=${OPTARG};;
        l) logLevel=${OPTARG};;
    esac
done

if [ -z "$branding" ]; then
    echo "-b for node branding"
    exit
fi

if [ -z "$outputDir" ]; then
    echo "-o for node outputDir"
    exit
fi

if [ -z "$subdomain" ]; then
    echo "-s for subdomain"
    exit
fi

echo "Running npx ts-node src/index.ts --branding=$branding --version=$version --outputDir=$outputDir --dataDir=$dataDir --subdomain=$subdomain --domain=$domain --increment=$increment --allowIP=$allowIP --logLevel=$logLevel"
npx ts-node src/index.ts --branding=${branding} --version=${version} --outputDir=${outputDir} --dataDir=${dataDir} --subdomain=${subdomain} --domain=${domain} --increment=${increment} --allowIP="${allowIP} --logLevel=${logLevel}" && chown -R 1005:1001 ${outputDir}/${branding}/*

if [ -n "$restart" ]; then
    echo "Restarting"
    docker-compose -f ${outputDir}/${branding}/docker-compose.yml down && docker-compose -f ${outputDir}/${branding}/docker-compose.yml up -d --remove-orphans
    exit
fi