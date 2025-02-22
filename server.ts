/* eslint-disable no-console */
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import fetch from "node-fetch";
import path from "path";
import { alldl } from "rahad-all-downloader";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

import { YtdlCore } from "@ybd-project/ytdl-core";
import express from "express";
import { generate } from "youtube-po-token-generator";

const app = express();
const PORT = process.env.PORT || 3000;

interface VideoFormat {
  url: string;
  itag: number;
  container: string;
  videoCodec: string | null;
  audioCodec: string | null;
  contentLength: string | null;
  qualityLabel: string | null;
}

const ALLOWED_QUALITIES = new Set([
  "144p",
  "240p",
  "360p",
  "480p",
  "720p",
  "1080p",
]);
const ALLOWED_CONTAINERS = new Set(["mp4", "webm"]);

function isValidYoutubeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ["youtube.com", "www.youtube.com", "youtu.be"].includes(
      parsedUrl.hostname
    );
  } catch {
    return false;
  }
}

async function expandTikTokUrl(shortUrl: string): Promise<string> {
  try {
    const response = await fetch(shortUrl, {
      method: "HEAD",
      redirect: "follow",
    });

    if (response.ok) {
      return response.url;
    }
    return shortUrl;
  } catch (error: unknown) {
    return shortUrl;
  }
}

function shortenTikTokUrl(url: string): string {
  console.log("url", url);
  // Regular expression to match TikTok video URLs
  const regex =
    /https:\/\/(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)(?:\?.*)?/;

  const match = url.match(regex);
  console.log("match", match);
  if (match?.[1]) {
    // If the URL matches the pattern, return the shortened version
    return `https://vt.tiktok.com/${match[1]}`;
  } else {
    // If the URL doesn't match the expected pattern, return the original URL
    console.warn(
      "The provided URL does not match the expected TikTok video URL pattern."
    );
    return url;
  }
}

app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "You can only make 100 requests per 15min",
});
app.use(limiter);

app.get("/youtube-info", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string" || !isValidYoutubeUrl(url)) {
      return res.status(400).json({ error: "Invalid or missing YouTube URL" });
    }

    const userData = await generate();
    if (!userData?.poToken || !userData.visitorData) {
      return res.status(500).json({ error: "Failed to generate user data" });
    }

    const ytd = new YtdlCore({
      poToken: userData.poToken,
      visitorData: userData.visitorData,
    });

    const info = await ytd.getFullInfo(url);

    const videoFormat: VideoFormat[] = [];
    const audioFormat: VideoFormat[] = [];
    info.formats.forEach((f) => {
      if (f.container && ALLOWED_CONTAINERS.has(f.container)) {
        if (
          f.hasVideo &&
          f.codec.video &&
          f.url &&
          f.quality.label &&
          ALLOWED_QUALITIES.has(f.quality.label)
        ) {
          const { quality, contentLength } = f;
          videoFormat.push({
            url: f.url,
            itag: f.itag,
            container: f.container,
            videoCodec: f.codec.video,
            audioCodec: f.codec.audio,
            contentLength: contentLength,
            qualityLabel: quality.label,
          });
        } else if (f.hasAudio && f.codec.audio && !f.codec.video && f.url) {
          const { itag, contentLength } = f;

          audioFormat.push({
            url: f.url,
            itag: itag,
            container: f.container,
            videoCodec: f.codec.video,
            audioCodec: f.codec.audio,
            contentLength: contentLength,
            qualityLabel: f.quality.label,
          });
        }
      }
    });

    const result = {
      title: info.videoDetails.title,
      thumbnail:
        info.videoDetails.thumbnails && info.videoDetails.thumbnails.length > 0
          ? info.videoDetails.thumbnails[
              info.videoDetails.thumbnails.length - 1
            ]?.url ?? null
          : null,
      formats: {
        video: videoFormat,
        audio: audioFormat,
      },
    };

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(result, null, 2));
  } catch (error: unknown) {
    console.error("Error:", error);
    res.status(500).json({
      error: "An error occurred while processing the video",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/social-info", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Invalid or missing social URL" });
    }

    let validUrl = url;
    if (validUrl.includes("tiktok")) {
      const expandedUrl = await expandTikTokUrl(validUrl);
      const shortUrl = shortenTikTokUrl(expandedUrl);
      const resultData = await alldl(shortUrl);
      if (!resultData.data.title || !resultData.data.videoUrl) {
        return res.status(500).json({
          error: "An error occurred while processing the video",
        });
      }
      return res.status(200).json({
        title: resultData.data.title,
        url: resultData.data.videoUrl,
      });
    }
    const resultData = await alldl(validUrl);
    const { title, videoUrl } = resultData.data;
    if (!title || !videoUrl) {
      res.status(500).json({
        error: "An error occurred while processing the video",
      });
    }

    const result = {
      title: title,
      url: videoUrl,
    };

    res.status(200).json(result);
  } catch (error: unknown) {
    console.error("Error:", error);
    res.status(500).json({
      error: "An error occurred while processing the video",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
    next();
  }
);

// eslint-disable-ncontainer-line no-console
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
