import Replicate from 'replicate';

let client: Replicate | null = null;

export function getReplicateClient(): Replicate {
  if (!client) {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      throw new Error('REPLICATE_API_TOKEN lipsește din variabilele de mediu.');
    }
    client = new Replicate({ auth: token });
  }
  return client;
}

export function bufferToDataUri(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

export async function downloadToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Nu s-a putut descărca rezultatul AI: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
