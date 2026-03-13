import crypto from 'node:crypto'

function generate128BitKey(apiKey: string) {
  const hmac = crypto.createHmac('sha256', apiKey).digest('hex')
  return hmac.slice(0, 32)
  // AES requires 128-bit key, but each hex char is 4 bits!
}

interface Payload {
  companyId?: string
  clientId?: string
  internalUserId?: string
  workspaceId: string
}

function encryptAES128BitToken(key: string, payload: string) {
  const keyBuffer = Buffer.from(key, 'hex')
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv('aes-128-cbc', keyBuffer, iv)

  // Encrypt the payload
  let encrypted: Buffer<ArrayBuffer> = cipher.update(payload, 'utf-8')
  encrypted = Buffer.concat([encrypted, cipher.final()])

  // add IV and ciphertext for final bufer
  const tokenBuffer = Buffer.concat([iv, encrypted])

  return tokenBuffer.toString('hex')
}

export function createCustomToken(apiKey: string, payload: Payload) {
  const payloadString = JSON.stringify(payload)
  const key = generate128BitKey(apiKey)
  return encryptAES128BitToken(key, payloadString)
}
