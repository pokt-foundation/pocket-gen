const replace = require('replace-in-file')
const fs = require('fs');
const csv = require('csv-parser');


// Variables
// const nodeBranding = 'sky'
// const nodeExternalSubdomain = 'skylabs'
// const rpcPortPrefix = '62'
// const p2pPortPrefix = '63'
const nodeBranding = 'nacho'
const nodeExternalSubdomain = 'pokt'
const rpcPortPrefix = '42'
const p2pPortPrefix = '43'

const nodeIncrement = 1
const nodeDomain = 'nachonodes.com'
const baseOutputDirectory = '/home/alex/nodes/pokt'
const baseDataDirectory = '/mnt/pokt'

// Global
const outputDirectory = `${baseOutputDirectory}/${nodeBranding}`
const accountsFile = `./src/accounts/${nodeBranding}nodes.csv`

// nginx default.conf
// const allowIPRange = '10.0.0.0/24'
const allowIPRange = '192.168.0.0/16'

// docker-compose.yml
const nodeImage = 'pocketfoundation/pocket-core:RC-0.6.3.6'
const nodeCPUs = '2'
const nodeMemLimit = '4G'
const poktDataDirectory = `${baseDataDirectory}/${nodeBranding}`

// config.json
const monikerPrefix = 'pokt'
const logLevel = '*:info, *:error'
const rpcPort = '8082'
const seeds = '03b74fa3c68356bb40d58ecc10129479b159a145@seed1.mainnet.pokt.network:20656,64c91701ea98440bc3674fdb9a99311461cdfd6f@seed2.mainnet.pokt.network:21656,a5f4a4cd88db9fd5def1574a0bffef3c6f354a76@seed9.mainnet.pokt.network:28856'
const persistentpeers = '9163d3c9963f6cf554f1fb69a6ff94703c4eee12@peer1:4300'
const unconditionalPeerIDs = '9163d3c9963f6cf554f1fb69a6ff94703c4eee12'

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')

interface Node {
  address: string
  privateKey: string
}

async function main() {
  const csv = require('csv-parser')
  const nodes: Node[] = []

  fs.createReadStream(accountsFile).pipe(csv())
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

  let destination = `${outputDirectory}/default.conf`
  fs.copyFile('./src/templates/default.conf', destination, async (err: any) => {
    if (err) throw err;

    let inc = nodeIncrement
    let servers = ''

    for (const node of nodes) {

      let serverBlockCopy = serverBlock.toString()
      serverBlockCopy = serverBlockCopy
        .replace(/{{rpcPort}}/g, `${rpcPortPrefix}${zeroPad(inc,2)}`)
        .replace(/{{fqdn}}/g, `${nodeExternalSubdomain}-${inc}.${nodeDomain}`)
        .replace(/{{inc}}/g, `${inc}`)
        .replace(/{{allowIPRange}}/g, `${allowIPRange}`)
        .replace(/{{nodeBranding}}/g, `${nodeBranding}`)
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

  let destination = `${outputDirectory}/docker-compose.yml`
  fs.copyFile('./src/templates/docker-compose.yml', destination, async (err: any) => {
    if (err) throw err;

    // Build services list
    let inc = nodeIncrement
    let services = ''
    let firstPort = ''
    let lastPort = ''
    let dependsOn = ''

    for (const node of nodes) {
      if (firstPort === '') { firstPort = `${rpcPortPrefix}${zeroPad(inc,2)}` }

      let poktBlockCopy = poktBlock.toString()
      poktBlockCopy = poktBlockCopy
        .replace(/{{nodeMoniker}}/g, `${nodeBranding}${inc}`)
        .replace(/{{nodeImage}}/g, `${nodeImage}`)
        .replace(/{{nodeCPUs}}/g, `${nodeCPUs}`)
        .replace(/{{nodeMemLimit}}/g, `${nodeMemLimit}`)
        .replace(/{{poktDataDirectory}}/g, `${poktDataDirectory}`)
        .replace(/{{rpcPort}}/g, `${rpcPort}`)
        .replace(/{{p2pPort}}/g, `${p2pPortPrefix}${zeroPad(inc,2)}`)
        .replace(/{{inc}}/g, `${inc}`)
      services = `${services}\n\n${poktBlockCopy}`

      dependsOn = `${dependsOn}\n      - "${nodeBranding}${inc}"`
      inc++
    }
    lastPort = `${rpcPortPrefix}${zeroPad(inc-1,2)}`

    let nginxBlockCopy = nginxBlock.toString()
    nginxBlockCopy = nginxBlockCopy
      .replace(/{{nodeBranding}}/g, `${nodeBranding}`)
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
  let inc = nodeIncrement
  for (const node of nodes) {
    nodeReplace(inc, node.privateKey)
    inc++
  }
}

// CONFIG.JSON
async function nodeReplace(inc: number, pocketCoreKey: string) {
  const nodeOutputDirectory = `${outputDirectory}/${inc}`
  if (!fs.existsSync(nodeOutputDirectory)){
    fs.mkdirSync(nodeOutputDirectory);
  }
  
  let destinationConfig = `${nodeOutputDirectory}/config.json`
  fs.copyFile('./src/templates/config.json', destinationConfig, async (err: any) => {
    if (err) throw err;
    const options = {
      files: destinationConfig,
      from: [/{{nodeMoniker}}/g, /{{nodeExternalAddress}}/g, /{{logLevel}}/g, /{{rpcPort}}/g, /{{p2pPort}}/g, /{{seeds}}/g, /{{persistentPeers}}/g, /{{unconditionalPeerIDs}}/g],
      to: [`${nodeBranding}-${inc}`, `${nodeExternalSubdomain}-${inc}.${nodeDomain}`, `${logLevel}`, `${rpcPort}`, `${p2pPortPrefix}${zeroPad(inc,2)}`, `${seeds}`, `${persistentpeers}`, `${unconditionalPeerIDs}`],
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