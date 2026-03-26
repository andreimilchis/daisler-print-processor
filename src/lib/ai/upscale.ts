import { getReplicateClient, bufferToDataUri, downloadToBuffer } from "./replicate-client";

export async function upscaleImage(
  buffer: Buffer,
  scale: 2 | 4 = 2
): Promise<Buffer> {
  const replicate = getReplicateClient();

  const output = await replicate.run(
    "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
    {
      input: {
        image: bufferToDataUri(buffer, "image/png"),
        scale,
        face_enhance: false,
      },
    }
  );

  // Output is a URL string
  const outputUrl = typeof output === "string" ? output : String(output);
  return downloadToBuffer(outputUrl);
}
