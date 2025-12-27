export type SupportedReadable = ReadableStream | NodeJS.ReadableStream

export const streamToBuffer = async (
  stream: SupportedReadable
): Promise<Buffer> => {
  const chunks: Buffer[] = []

  if ('getReader' in stream) {
    const reader = stream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(Buffer.from(value))
    }
  } else {
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }
  }

  return Buffer.concat(chunks)
}

export const bufferToReadable = async (
  data: Buffer
): Promise<ReadableStream | NodeJS.ReadableStream> => {
  if (typeof ReadableStream !== 'undefined') {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(data)
        controller.close()
      },
    })
  }

  const { Readable } = await import('stream')
  return Readable.from(data)
}
