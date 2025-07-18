import { join } from "path";
import { promises as fs } from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegStatic);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoPath, audioPath } = req.body;

  if (!videoPath || !audioPath) {
    return res.status(400).json({ error: "Missing video or audio path" });
  }

  const uploadDir = "./uploads";
  const mergedFilename = `merged-${Date.now()}.mp4`;
  const mergedFilePath = join(uploadDir, mergedFilename);

  try {
    await fs.access(join(uploadDir, videoPath));
    await fs.access(join(uploadDir, audioPath));

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(join(uploadDir, videoPath))
        .input(join(uploadDir, audioPath))
        .outputOptions(["-c:v copy", "-c:a aac", "-strict experimental", "-shortest"])
        .saveToFile(mergedFilePath)
        .on("end", resolve)
        .on("error", reject);
    });

    return res.status(200).json({
      message: "✅ Merged successfully",
      mergedFile: `/uploads/${mergedFilename}`,
    });
  } catch (err) {
    console.error("Merge error:", err);
    return res.status(500).json({ error: "Error merging video and audio" });
  }
}
