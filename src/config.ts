// Variables
// export const nodeBranding = 'sky'
// export const nodeExternalSubdomain = 'skylabs'
// export const rpcPortPrefix = '62'
// export const p2pPortPrefix = '63'
export const nodeBranding = 'nacho'
export const nodeExternalSubdomain = 'pokt'
export const rpcPortPrefix = '42'
export const p2pPortPrefix = '43'

export const nodeIncrement = 1
export const nodeDomain = 'nachonodes.com'
export const baseOutputDirectory = '/home/alex/nodes/pokt'
export const baseDataDirectory = '/mnt/pokt'

// Global
export const outputDirectory = `${baseOutputDirectory}/${nodeBranding}`
export const accountsFile = `./src/accounts/${nodeBranding}nodes.csv`

// nginx default.conf
// export const allowIPRange = '10.0.0.0/24'
export const allowIPRange = '192.168.0.0/16'

// docker-compose.yml
export const nodeImage = 'pocketfoundation/pocket-core:RC-0.6.3.6'
export const nodeCPUs = '2'
export const nodeMemLimit = '4G'
export const poktDataDirectory = `${baseDataDirectory}/${nodeBranding}`

// config.json
export const monikerPrefix = 'pokt'
export const logLevel = '*:info, *:error'
export const rpcPort = '8082'
export const seeds = '03b74fa3c68356bb40d58ecc10129479b159a145@seed1.mainnet.pokt.network:20656,64c91701ea98440bc3674fdb9a99311461cdfd6f@seed2.mainnet.pokt.network:21656,a5f4a4cd88db9fd5def1574a0bffef3c6f354a76@seed9.mainnet.pokt.network:28856'
export const persistentpeers = '9163d3c9963f6cf554f1fb69a6ff94703c4eee12@peer1:4300'
export const unconditionalPeerIDs = '9163d3c9963f6cf554f1fb69a6ff94703c4eee12'