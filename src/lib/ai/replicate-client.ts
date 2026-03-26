import Replicate from "replicate";

let _client: Replicate | null = null;

export function getReplicateClient(): Replicate {
  if (!_client) {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      throw new Error("REPLICATE_API_TOKEN nu este configurat. Adaugă-l în .env.local sau Vercel dashboard.");
    }
    _client = new Replicate({ auth: token });
  }
  return _client;
}

export function bufferToDataUri(buffer: Buffer, mimeType = "image/png"): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function downloadToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download from ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
