import React, { useState } from "react";

export default function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mergedFile, setMergedFile] = useState(null);

  const handleUpload = async () => {
    if (!videoFile || !audioFile) {
      alert("Please select both video and audio files.");
      return;
    }

    setStatus("Uploading files...");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("audio", audioFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ Files uploaded successfully!");
        await handleMerge(data.video, data.audio);
      } else {
        setStatus("❌ Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      setStatus("❌ Error uploading files.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMerge = async (videoPath, audioPath) => {
    setStatus("🔄 Merging video and audio...");

    try {
      const res = await fetch("/api/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoPath, audioPath }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("🎉 Merge complete!");
        setMergedFile(data.mergedFile);
      } else {
        setStatus("❌ Merge failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setStatus("❌ Error during merge.");
      console.error("Merge fetch error:", err);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 30 }}>
      <h1>🎵 ClipVibe - Upload Video & Song</h1>
      <p>Select a video and a song to upload:</p>

      <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
      <br />
      <br />
      <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} />
      <br />
      <br />

      <button disabled={isUploading} onClick={handleUpload}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>

      {mergedFile && (
        <>
          <br />
          <br />
          <h3>✅ Merged File</h3>
          <a href={mergedFile} download>
            Download Merged Video
          </a>
        </>
      )}

      <p style={{ marginTop: 20 }}>{status}</p>
    </div>
  );
}
