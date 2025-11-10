import { bucketRepository } from "@repo/repositories";
import type { Route } from "./+types/upload-file";
import type { R2Bucket } from "@cloudflare/workers-types";

export async function action({ request, context }: Route.ActionArgs) {
  const bucket = context.cloudflare.env.BUCKET;

  if (!bucket) {
    throw new Response("R2 bucket not configured", { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    throw new Response("No file provided", { status: 400 });
  }

  try {
    const key = await bucketRepository.uploadToR2(
      bucket as unknown as R2Bucket,
      file
    );
    return { success: true, key };
  } catch (error) {
    console.error("Upload failed:", error);
    throw new Response(
      error instanceof Error ? error.message : "Upload failed",
      { status: 500 }
    );
  }
}
