import * as FileSystem from "expo-file-system";

const HOST = "http://betterlife-future.com:8004";
export enum ErrorType {
  unknown,
  privateVideo,
  invalidUrl,
}

export enum SocialMediaType {
  FACEBOOK = "facebook",
  YOUTUBE = "youtube",
  INSTAGRAM = "instagram",
  TWITTER = "twitter",
  TIKTOK = "tiktok",
}

export interface ResponseData<T> {
  data?: T;
  errorMessage?: string;
}

export interface FbVideoData {
  fileName: string;
  urls: { url: string; quality: string }[];
}
export interface LoadFbUrlResponse {
  errorMessage?: string;
  errorMessageType?: ErrorType;
  success?: FbVideoData;
}

export interface YouTubeVideoFormat {
  url: string;
  itag: number;
  container: string;
  videoCodec?: string | null;
  audioCodec?: string | null;
  contentLength?: string | null;
  qualityLabel?: string | null;
}

export interface YTRequestFormat {
  title: string;
  thumbnail?: string;
  socialMedia: SocialMediaType;
  formats: {
    video: YouTubeVideoFormat[];
    audio: YouTubeVideoFormat[];
  };
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

/**
 * Fetches the video URL from Facebook and returns the video file name and a list of download options.
 *
 * @param videoUrl The URL of the Facebook video.
 * @returns A promise that resolves with an object containing:
 *   - `success`: An object with the video file name and a list of download options.
 *   - `errorMessage`: An error message if something went wrong.
 *   - `errorMessageType`: An enum value indicating the type of error that occurred.
 */
export const fetchSocialUrl = async (
  videoUrl: string,
  socialMedia: SocialMediaType
): Promise<ResponseData<YTRequestFormat>> => {
  try {
    const response = await fetch(`${HOST}/social-info?url=${videoUrl}`);

    if (response.status !== 200 || !response.ok) {
      return {
        errorMessage:
          "Failed to get the video info. Check if the URL is valid or is not private. we only support a public video.",
      };
    }
    const data = await response.json();
    return {
      data: {
        title: data["title"],
        socialMedia: socialMedia,
        formats: {
          video: [
            {
              url: data["url"],
              itag: 0,
              container: "mp4",
              qualityLabel: "360p",
              videoCodec: "h264",
              audioCodec: "aac",
            },
          ],
          audio: [],
        },
      },
    };
  } catch (error) {
    console.error("Error", "An error occurred while processing the video");
    return {
      errorMessage: error as string,
    };
  }
};

/**
 * Fetches video info for a YouTube video by its URL.
 *
 * @param {string} url The URL of the YouTube video.
 * @returns {Promise<void>} A promise that resolves when the video info is fetched.
 */
export const fetchYouTubeVideoByUrl = async (
  url: string
): Promise<ResponseData<YTRequestFormat>> => {
  if (url.includes("facebook")) {
    const result = await fetchSocialUrl(url, SocialMediaType.FACEBOOK);

    return result;
  }
  if (url.includes("tiktok")) {
    const result = await fetchSocialUrl(url, SocialMediaType.TIKTOK);

    return result;
  }
  try {
    const response = await fetch(`${HOST}/youtube-info?url=${url}`);

    if (response.status !== 200 || !response.ok) {
      return {
        errorMessage: "Failed to get the video info.",
      };
    }
    const data = await response.json();

    const sortedFormats = sortYDlByBestMatch(data);
    return sortedFormats
      ? { data: { ...sortedFormats, socialMedia: SocialMediaType.YOUTUBE } }
      : {
          errorMessage:
            "Something went wrong. Please try again. if the error persists contact us.",
        };
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return {
      errorMessage:
        "Something went wrong. Please try again. if the error persists contact us.",
    };
  }
};

/**
 * Selects the best video and audio formats for the given YouTube request format and target resolution.
 * If the target resolution is not available, returns null.
 * @param yTRequestFormat The YouTube request format
 * @param targetResolution The target video resolution
 * @returns An object containing the best video and audio formats, or null if no formats are available
 */
export const sortYDlByBestMatch = (
  yTRequestFormat: YTRequestFormat
): YTRequestFormat | null => {
  if (
    yTRequestFormat.formats.audio.length === 0 &&
    yTRequestFormat.formats.video.length === 0
  ) {
    return null;
  }

  yTRequestFormat.formats.video = yTRequestFormat.formats.video.filter(
    (format) => format.videoCodec !== null && format.audioCodec !== null
  );
  yTRequestFormat.formats.audio = yTRequestFormat.formats.audio.filter(
    (format) => format.audioCodec !== null
  );

  return yTRequestFormat.formats.audio.length === 0 &&
    yTRequestFormat.formats.video.length === 0
    ? null
    : yTRequestFormat;
};

/**
 * Downloads and processes a YouTube video.
 * @param title The title of the video.
 * @param format An object containing the video and audio formats of the video.
 * @param targetResolution The target resolution of the video.
 * @param progressCallback A callback for reporting progress of the download.
 * @returns The path of the downloaded and processed video, or null if an error occurred.
 */
export const downloadAndSaveData = async (
  savePath: string,
  url: string,
  progressCallback: (progress: number) => void
): Promise<ResponseData<string>> => {
  try {
    const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      progressCallback(progress);
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      savePath,
      {},
      callback
    );
    const result = await downloadResumable.downloadAsync();

    console.log("Finished download to ", result?.uri);

    return { data: result?.uri };
  } catch (error) {
    return {
      errorMessage: "An error occurred while processing the video",
    };
  }
};

const bytesToMB = (bytes: number) => {
  return (bytes / (1024 * 1024)).toFixed(2);
};

export const estimateDownloadSize = (size: number) => {
  return bytesToMB(size);
};

export const isExpired = (timeInMilliseconds: number) => {
  return Date.now() > timeInMilliseconds;
};

export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
