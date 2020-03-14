const memoryjs = require('memoryjs')
const processName = 'DarkSoulsRemastered.exe'
const util = require('util')
const tmi = require('tmi.js')

const processObject = memoryjs.openProcess(processName)
const asyncReadMemory = util.promisify(memoryjs.readMemory)

const channelName = ''

const opts = {
  identity: {
    username: '',
    password: ''
  },
  channels: [channelName]
}

const client = new tmi.client(opts)
client.on('message', onMessageHandler)
client.connect()

function onMessageHandler (target, context, msg, self) {
  if (self) {
    return
  }

  const args = msg.slice(1).split(' ')
  const command = args.shift().toLowerCase()

  switch (command) {
    case 'deaths': getDeaths(); break
    default: break
  }
}

function getDeaths () {
  readDeathCount().then(deathCount => {
    client.say(channelName, 'Death count: ' + deathCount)
  })
}

const readPointer = (address, type = 'int64') => {
  return asyncReadMemory(processObject.handle, address, type)
}

const getDeathCount = async () => {
  const basePtr = await readPointer(processObject.modBaseAddr + 0x01C67AF0)
  const heroPtr = await readPointer(basePtr + 0xB0)
  const deathCount = await readPointer(heroPtr + 0x98, 'int32')
  return deathCount
}
