export default function bufferStream(
  stream: NodeJS.ReadableStream
): Promise<Buffer> {
  return new Promise((accept, reject) => {
    const chunks: Uint8Array[] = [];

    stream
      .on('error', reject)
      .on('data', chunk => chunks.push(chunk))
      .on('end', () => accept(Buffer.concat(chunks)));
  });
}
