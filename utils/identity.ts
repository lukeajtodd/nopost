import Ceramic from '@ceramicnetwork/http-client'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { IDX } from '@ceramicstudio/idx'
import { ThreeIdConnect, EthereumAuthProvider } from '@3id/connect'
import { DID } from 'dids'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import StreamID from '@ceramicnetwork/streamid'

// const aliases = {
//   alias1: 'definitionID 1',
//   alias2: 'definitionID 2',
// }

let window: any

const ceramic = new Ceramic('https://ceramic-clay.3boxlabs.com')
const idx = new IDX({ ceramic })

const resolver = {
  ...ThreeIdResolver.getResolver(ceramic),
}
const did = new DID({ resolver })
ceramic.did = did

interface IStreamIdentifiers {
  [key: string]: string
}

const streamIdentifiers: IStreamIdentifiers = {}

const getUserAddresses = async () => {
  return await window.ethereum.enable()
}

const connectAuth = async () => {
  const addresses: string[] = await getUserAddresses()
  const threeIdConnect = new ThreeIdConnect()
  const authProvider = new EthereumAuthProvider(window.ethereum, addresses[0])
  await threeIdConnect.connect(authProvider)
  const provider = await threeIdConnect.getDidProvider()

  if (!ceramic || !ceramic.did) {
    console.error('Ceramic instance or DID has not been configured.')
    return
  }

  ceramic.did.setProvider(provider)
  await ceramic.did.authenticate()
}

// Will be the equivalent of adding a post as a stream
const createStream = async () => {
  if (!ceramic || !ceramic.did) {
    console.error('Ceramic instance or DID has not been configured.')
    return
  }

  const doc = await TileDocument.create(
    ceramic,
    {
      test: 'test'
    },
    {
      controllers: [ceramic.did.id]
    }
  )

  const streamId = doc.id.toString()

  await ceramic.pin.add((streamId as unknown as StreamID))

  streamIdentifiers['test'] = streamId
}

// Equivalent of updating a post
const updateStream = async (streamId: string) => {
  const doc = await TileDocument.load(ceramic, streamId)
  await doc.update(
    {
      test: 'newtest'
    },
    // This is the metadata, it doesn't have to be updated
    // {
    //   controllers: [ceramic.did.id]
    // }
  )
}

// Equivalent of getting a post
const getStream = async (streamId: string): Promise<TileDocument<any>> => {
  const doc = await TileDocument.load(ceramic, streamId);
  return doc
}

// Listing own posts
const listMyPinnedStreams = async () => {
  const streamIds = await ceramic.pin.ls()
}

// Will be the equivalent of creating a profile on idx
const createProfile = async () => {
  await idx.set('basicProfile', {
    name: 'Alan Turing',
    description: 'I make computers beep good.',
    emoji: '💻',
  })
}

// Will be the equivalent of updating a profile
const updateProfile = async () => {
  await idx.set('basicProfile', { name: 'Alan Turing' })
}

// Getting a profile
const getProfile = async () => {
  if (!ceramic || !ceramic.did) {
    console.error('Ceramic instance or DID has not been configured.')
    return
  }

  await idx.get('basicProfile', ceramic.did.id)
  // This uses the currently authenticated user
  // await idx.get('basicProfile')
}