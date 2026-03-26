import { getReplicateClient, bufferToDataUri, downloadToBuffer } from "./replicate-client";

export async function removeBackground(buffer: Buffer): Promise<Buffer> {
  const replicate = getReplicateClient();

  const output = await replicate.run(
    "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
    {
      input: {
        image: bufferToDataUri(buffer, "image/png"),
      },
    }
  );

  const outputUrl = typeof output === "string" ? output : String(output);
  return downloadToBuffer(outputUrl);
}
