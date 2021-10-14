const args = require('minimist')(process.argv.slice(2));

export const nodeBranding = (args['branding']) ? args['branding'] : 'nacho'
export const nodeExternalSubdomain = (args['subdomain']) ? args['subdomain'] : 'pokt'
export const rpcPortPrefix = '42'
export const p2pPortPrefix = '43'

export const nodeIncrement = 1
export const nodeDomain = (args['domain']) ? args['domain'] : 'nachoracks.com'
export const baseOutputDirectory = (args['outputDir']) ? args['outputDir'] : '/root/nodes/pokt'
export const baseDataDirectory = (args['dataDir']) ? args['dataDir'] : '/data'

// Global
export const outputDirectory = `${baseOutputDirectory}/${nodeBranding}`
export const accountsFile = `./src/accounts/${nodeBranding}nodes.csv`

// nginx default.conf
// export const allowIPRange = '10.0.0.0/24'
export const allowIPRange = '192.168.0.0/16'

// docker-compose.yml
export const nodeImage = (args['version']) ? `pocketfoundation/pocket-core:${args['version']}` : 'pocketfoundation/pocket-core:latest'
export const nodeCPUs = '4'
export const nodeMemLimit = '8G'
export const poktDataDirectory = `${baseDataDirectory}/${nodeBranding}`

// config.json
export const monikerPrefix = (args['subdomain']) ? args['subdomain'] : 'pokt'
export const logLevel = '*:info, *:error'
export const rpcPort = '8082'
export const seeds = '03b74fa3c68356bb40d58ecc10129479b159a145@seed1.mainnet.pokt.network:20656,64c91701ea98440bc3674fdb9a99311461cdfd6f@seed2.mainnet.pokt.network:21656,a5f4a4cd88db9fd5def1574a0bffef3c6f354a76@seed9.mainnet.pokt.network:28856'
export const persistentpeers = ''
export const unconditionalPeerIDs = ''
