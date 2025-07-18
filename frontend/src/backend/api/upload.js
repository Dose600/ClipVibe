import fs from "fs";
import path from "path";
import formidable from "formidable";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
const allowedAudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];
const MAX_FILE_SIZE = 100 * 1024 * 1024;

function sanitizeFilename(file) {
  const ext = path.extname(file.originalFilename);
  return `${uuidv4()}${ext}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  form.parse(req, (err, _fields, files) => {
    const video = files.video?.[0];
    const audio = files.audio?.[0];

    if (!video || !audio) {
      return res.status(400).json({ error: "Missing video or audio file" });
    }

    if (!allowedVideoTypes.includes(video.mimetype)) {
      return res.status(400).json({ error: "Invalid video file type" });
    }

    if (!allowedAudioTypes.includes(audio.mimetype)) {
      return res.status(400).json({ error: "Invalid audio file type" });
    }

    if (video.size > MAX_FILE_SIZE || audio.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: "File size exceeds limit (100MB)" });
    }

    const videoFilename = sanitizeFilename(video);
    const audioFilename = sanitizeFilename(audio);

    const videoNewPath = path.join(uploadDir, videoFilename);
    const audioNewPath = path.join(uploadDir, audioFilename);

    try {
      fs.renameSync(video.filepath, videoNewPath);
      fs.renameSync(audio.filepath, audioNewPath);

      return res.status(200).json({
        message: "Files uploaded successfully",
        video: `/uploads/${videoFilename}`,
        audio: `/uploads/${audioFilename}`,
      });
    } catch (moveErr) {
      console.error("Error moving files:", moveErr);
      return res.status(500).json({ error: "Error saving files" });
    }
  });
        }
