/* eslint-disable no-console */
import dotenv from "dotenv";
import helmet from "helmet";
import fetch from "node-fetch";
import path from "path";
import { alldl } from "rahad-all-downloader";
import ytdl from "@distube/ytdl-core";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// import { YtdlCore } from "@ybd-project/ytdl-core";
import express from "express";
import { generate } from "youtube-po-token-generator";

const app = express();
const PORT = (process.env.PORT as number | undefined) || 3000;
const HOST = process.env.VIDEO_MAX_HOST || "0.0.0.0";

interface VideoFormat {
  url: string;
  itag: number;
  container: string;
  videoCodec?: string | null;
  audioCodec?: string | null;
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
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
//   message: "You can only make 100 requests per 15min",
// });
// app.use();

app.get("/youtube-info", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string" || !isValidYoutubeUrl(url)) {
      return res.status(400).json({ error: "Invalid or missing YouTube URL" });
    }

    res.setHeader("Access-Control-Allow-Headers", "*");

    const userData = await generate();
    if (!userData?.poToken || !userData.visitorData) {
      return res.status(500).json({ error: "Failed to generate user data" });
    }

    // const ytd = new YtdlCore({
    //   hl: "en",
    //   gl: "US",
    //   poToken: userData.poToken,
    //   visitorData: userData.visitorData,
    //   disableDefaultClients: true,
    //   disablePoTokenAutoGeneration: true,
    //   disableInitialSetup: true,
    //   parsesHLSFormat: false,
    //   noUpdate: true,
    //   logDisplay: ["warning", "error"],
    //   html5Player: {
    //     useRetrievedFunctionsFromGithub: true,
    //   },
    // });

    const cookies = [
      {
        name: "__Secure-1PAPISID",
        value: "wuO6xPfvP7Vy1il0/AIpIUXJL2ZsI3H8n6",
        domain: ".youtube.com",
        path: "/",
        secure: true,
      },
      {
        name: "__Secure-1PSID",
        value:
          "g.a000tQiEnADLQ7RSxCbA9gfmm7nve-spMsrqnW5OkvXPK16tUDBK5Ovrq2pyOlRC3SSOzSEzYgACgYKAasSAQASFQHGX2Mi8NS77DiuClRtWEqsIOL_ShoVAUF8yKopGSAMSd7fX89Fwkkv2M9D0076",
        domain: ".youtube.com",
        path: "/",
        secure: true,
      },
      {
        name: "__Secure-1PSIDCC",
        value:
          "AKEyXzXW0trSHbmn3Qpq-zlzHrx4XLlcBhYs5s3pEIWxVlaM36akMrupxkwd-Pu1ZmSMpiakmA",
        domain: ".youtube.com",
        path: "/",
        secure: true,
      },
      {
        name: "__Secure-1PSIDTS",
        value:
          "sidts-CjIBEJ3XVw-0hNLro8leICJc2YNOx-ACevZwcH27slEiOQmNG7_ueNb32WgxjrsoIybRohAA",
        domain: ".youtube.com",
        path: "/",
        secure: true,
      },
      {
        name: "LOGIN_INFO",
        value:
          "AFmmF2swRgIhANpOyQHVDsB_iC13AVbB6lLI1e9i2P-VTSJ-VehDQI2xAiEAlIQLLHrl5XfsX7DIwwBNJ86Bi11gxU8eb9V3hqGb2MQ:QUQ3MjNmeW9MX1NybmV1d1NiLWk3V3FRaVdmZnpYTHo0U0lfRHJfYlZzUnZubU4yOUV1ZTRYalVHQXl4RGhQU2V4T1FNNGUzRGllSnUtbG9rb3VJMldqOTZYS3lBTnZRd21LaHI5VmJCeWs5bXo1aGRSN1NwZ3VqbzlfZk9vcFBjUktHbGs2UVVSX1VFcjhnOXoxTTE2RE1wdWFhWTgyZmhR",
        domain: ".youtube.com",
        path: "/",
        secure: true,
      },
      {
        name: "PREF",
        value: "tz=Africa.Douala&f6=40000000&f7=100&f4=4000000&f5=20000",
        domain: ".youtube.com",
        path: "/",
        secure: true,
      },
      {
        name: "SAPISID",
        value: "wuO6xPfvP7Vy1il0/AIpIUXJL2ZsI3H8n6",
        domain: ".youtube.com",
        path: "/",
        secure: true,
      },
      {
        name: "SID",
        value:
          "g.a000tQiEnADLQ7RSxCbA9gfmm7nve-spMsrqnW5OkvXPK16tUDBKHBZLRCjRYMGwsuITc2XkYwACgYKAWASAQASFQHGX2Miie8CRLKcFl2fZrtpWRg_dRoVAUF8yKrHxeC64Rbyiep-ZqL0zhfP0076",
        domain: ".youtube.com",
        path: "/",
        secure: false,
      },
      {
        name: "SIDCC",
        value:
          "AKEyXzUOEGUWacZNpVmrWp2rFp7Qh5NjaDQsCbvF23rpRWjxaq9j3EitOWOFfZqfm3BgmoUEfg",
        domain: ".youtube.com",
        path: "/",
        secure: false,
      },
      {
        name: "SSID",
        value: "AFCVYp92GPjlLXDAd",
        domain: ".youtube.com",
        path: "/",
        secure: true,
      },
    ];

    const agent = ytdl.createAgent(cookies);

    const info = await ytdl.getInfo(url, { agent });

    console.log(info);

    const videoFormat: VideoFormat[] = [];
    const audioFormat: VideoFormat[] = [];
    info.formats.forEach((f) => {
      if (f.container && ALLOWED_CONTAINERS.has(f.container)) {
        if (
          f.hasVideo &&
          f.videoCodec &&
          f.audioCodec &&
          f.url &&
          f.qualityLabel &&
          ALLOWED_QUALITIES.has(f.qualityLabel)
        ) {
          const { qualityLabel, contentLength } = f;
          videoFormat.push({
            url: f.url,
            itag: f.itag,
            container: f.container,
            videoCodec: f.videoCodec,
            audioCodec: f.audioCodec,
            contentLength: contentLength,
            qualityLabel: qualityLabel,
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
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
