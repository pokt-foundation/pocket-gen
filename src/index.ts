const replace = require('replace-in-file')
const fs = require('fs');
const csv = require('csv-parser');

import * as conf from './config'

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')

interface Node {
  address: string
  privateKey: string
}

async function main() {
  const csv = require('csv-parser')
  const nodes: Node[] = []

  fs.createReadStream(conf.accountsFile).pipe(csv())
  .on('data', (data: any) => nodes.push(data))
  .on('end', async () => {
    await processNodeReplacements(nodes)
    await processComposeReplacements(nodes)
    await processNginxReplacements(nodes)
    console.log('Done node replacements.')
  });
}

// NGINX
async function processNginxReplacements(nodes: Array<Node>) {
  const serverBlock = fs.readFileSync('./src/templates/nginx.server.block')

  let destination = `${conf.outputDirectory}/default.conf`
  fs.copyFile('./src/templates/default.conf', destination, async (err: any) => {
    if (err) throw err;

    let inc = conf.nodeIncrement
    let servers = ''

    for (const node of nodes) {

      let serverBlockCopy = serverBlock.toString()
      serverBlockCopy = serverBlockCopy
        .replace(/{{rpcPort}}/g, `${conf.rpcPortPrefix}${zeroPad(inc,2)}`)
        .replace(/{{fqdn}}/g, `${conf.nodeExternalSubdomain}-${inc}.${conf.nodeDomain}`)
        .replace(/{{inc}}/g, `${inc}`)
        .replace(/{{allowIPRange}}/g, `${conf.allowIPRange}`)
        .replace(/{{nodeBranding}}/g, `${conf.nodeBranding}`)
      servers = `${servers}\n\n${serverBlockCopy}`
      inc++
    }

    const options = {
      files: destination,
      from: [/{{servers}}/g],
      to: [`${servers}`],
    }
  
    try {
      const results = await replace(options)
    }
    catch (error) {
      console.error('Error occurred:', error)
    }
  });
}

// DOCKER COMPOSE
async function processComposeReplacements(nodes: Array<Node>) {
  const poktBlock = fs.readFileSync('./src/templates/compose.pokt.block')
  const nginxBlock = fs.readFileSync('./src/templates/compose.nginx.block')

  let destination = `${conf.outputDirectory}/docker-compose.yml`
  fs.copyFile('./src/templates/docker-compose.yml', destination, async (err: any) => {
    if (err) throw err;

    // Build services list
    let inc = conf.nodeIncrement
    let services = ''
    let firstPort = ''
    let lastPort = ''
    let dependsOn = ''

    for (const node of nodes) {
      if (firstPort === '') { firstPort = `${conf.rpcPortPrefix}${zeroPad(inc,2)}` }

      let poktBlockCopy = poktBlock.toString()
      poktBlockCopy = poktBlockCopy
        .replace(/{{nodeMoniker}}/g, `${conf.nodeBranding}${inc}`)
        .replace(/{{nodeImage}}/g, `${conf.nodeImage}`)
        .replace(/{{nodeCPUs}}/g, `${conf.nodeCPUs}`)
        .replace(/{{nodeMemLimit}}/g, `${conf.nodeMemLimit}`)
        .replace(/{{poktDataDirectory}}/g, `${conf.poktDataDirectory}`)
        .replace(/{{rpcPort}}/g, `${conf.rpcPort}`)
        .replace(/{{p2pPort}}/g, `${conf.p2pPortPrefix}${zeroPad(inc,2)}`)
        .replace(/{{inc}}/g, `${inc}`)
      services = `${services}\n\n${poktBlockCopy}`

      dependsOn = `${dependsOn}\n      - "${conf.nodeBranding}${inc}"`
      inc++
    }
    lastPort = `${conf.rpcPortPrefix}${zeroPad(inc-1,2)}`

    let nginxBlockCopy = nginxBlock.toString()
    nginxBlockCopy = nginxBlockCopy
      .replace(/{{nodeBranding}}/g, `${conf.nodeBranding}`)
      .replace(/{{nginxPortRange}}/g, `${firstPort}-${lastPort}`)
      .replace(/{{dependsOn}}/g, `${dependsOn}`)

    services = `\n\n${nginxBlockCopy}${services}`

    const options = {
      files: destination,
      from: [/{{services}}/g],
      to: [`${services}`],
    }
  
    try {
      const results = await replace(options)
    }
    catch (error) {
      console.error('Error occurred:', error)
    }
  });
}

async function processNodeReplacements(nodes: Array<Node>) {
  let inc = conf.nodeIncrement
  for (const node of nodes) {
    nodeReplace(inc, node.privateKey)
    inc++
  }
}

// CONFIG.JSON
async function nodeReplace(inc: number, pocketCoreKey: string) {
  const nodeOutputDirectory = `${conf.outputDirectory}/${inc}`
  if (!fs.existsSync(nodeOutputDirectory)){
    fs.mkdirSync(nodeOutputDirectory);
  }
  
  let destinationConfig = `${nodeOutputDirectory}/config.json`
  fs.copyFile('./src/templates/config.json', destinationConfig, async (err: any) => {
    if (err) throw err;
    const options = {
      files: destinationConfig,
      from: [/{{nodeMoniker}}/g, /{{nodeExternalAddress}}/g, /{{logLevel}}/g, /{{rpcPort}}/g, /{{p2pPort}}/g, /{{seeds}}/g, /{{persistentPeers}}/g, /{{unconditionalPeerIDs}}/g],
      to: [`${conf.nodeBranding}-${inc}`, `${conf.nodeExternalSubdomain}-${inc}.${conf.nodeDomain}`, `${conf.logLevel}`, `${conf.rpcPort}`, `${conf.p2pPortPrefix}${zeroPad(inc,2)}`, `${conf.seeds}`, `${conf.persistentpeers}`, `${conf.unconditionalPeerIDs}`],
    }
  
    try {
      const results = await replace(options)
      console.log('Results: ', results)
    }
    catch (error) {
      console.error('Error occurred:', error)
    }
  });  

  let destinationEnv = `${nodeOutputDirectory}/env`
  fs.copyFile('./src/templates/env', destinationEnv, async (err: any) => {
    if (err) throw err;
    const options = {
      files: destinationEnv,
      from: [/{{pocketCoreKey}}/g],
      to: [`${pocketCoreKey}`],
    }
  
    try {
      const results = await replace(options)
      console.log('Results: ', results)
    }
    catch (error) {
      console.error('Error occurred:', error)
    }
  }); 
}

main()