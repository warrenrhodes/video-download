import {
  FFmpegKit,
  FFmpegKitConfig,
  ReturnCode,
} from "ffmpeg-kit-react-native";
import * as FileSystem from "expo-file-system";

const HOST = "http://betterlife-future.com:8004";
export enum ErrorType {
  unknown,
  privateVideo,
  invalidUrl,
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

export interface MergeVideoAndAudioData {
  videoFormat: YouTubeVideoFormat;
  audioFormat: YouTubeVideoFormat;
  needsMerging: boolean;
  resolution: string;
  estimatedDownloadSize: string;
}

interface YouTubeVideoFormat {
  url: string;
  itag: number;
  container: string;
  videoCodec: string | null;
  audioCodec: string | null;
  contentLength: string | null;
  qualityLabel: string | null;
}

interface YTRequestFormat {
  title: string;
  thumbnail: string;
  formats: {
    video: YouTubeVideoFormat[];
    audio: YouTubeVideoFormat[];
  };
}

export interface YTRequestFormatWithSortedFormats extends YTRequestFormat {
  sortedFormats: MergeVideoAndAudioData[];
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
export const fetchFacebookUrl = async (
  videoUrl: string
): Promise<LoadFbUrlResponse> => {
  try {
    const response = await fetch("https://www.getfvid.com/downloader", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `url=${encodeURIComponent(videoUrl)}`,
    });

    const htmlContent = await response.text();

    if (
      htmlContent.includes("Uh-Oh! This video might be private and not public")
    ) {
      console.error("Error", "This video is private");
      return { errorMessageType: ErrorType.privateVideo };
    }

    const regexNama = /<p class="card-text">(.*?)<\/p>/g;
    const nameMatch = regexNama.exec(htmlContent);
    const videoFileName = nameMatch ? `${nameMatch[1]}` : "";

    const rgx =
      /<a href="(.+?)" target="_blank" class="btn btn-download"(.+?)>(.+?)<\/a>/g;
    const matches = htmlContent.matchAll(rgx);
    const downloadOptions = Array.from(matches, (m) => ({
      quality: m[3].includes("HD") ? "Download In HD Quality" : m[3],
      url: m[1].replace(/amp;/g, ""),
    }));

    if (downloadOptions.length > 0) {
      console.log(
        "Download options:",
        downloadOptions.map((option) => ({
          url: option.url,
          quality: option.quality,
        }))
      );
      return {
        success: {
          fileName: videoFileName,
          urls: downloadOptions.map((option) => ({
            url: option.url,
            quality: option.quality,
          })),
        },
      };
    } else {
      return {
        errorMessage: "Invalid Video URL",
        errorMessageType: ErrorType.invalidUrl,
      };
    }
  } catch (error) {
    console.error("Error:", error);
    console.error("Error", "An error occurred while processing the video");
    return {
      errorMessage: "An error occurred while processing the video",
      errorMessageType: ErrorType.unknown,
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
): Promise<YTRequestFormatWithSortedFormats | null> => {
  try {
    // const response = await fetch(`${HOST}/video-info?url=${url}`);
    // console.log("Response:", response.status, response.ok);

    // if (response.status !== 200 || !response.ok) {
    //   return null;
    // }
    const resultsData: YTRequestFormat = FAKERESULT;

    const sortedFormats = sortYDlByBestMatch(resultsData);

    return (
      sortedFormats && {
        ...resultsData,
        sortedFormats: sortedFormats,
      }
    );
  } catch (error) {
    console.error("Error fetching video info:", error);
    return null;
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
): MergeVideoAndAudioData[] | null => {
  if (
    yTRequestFormat.formats.audio.length === 0 &&
    yTRequestFormat.formats.video.length === 0
  ) {
    return null;
  }

  let sortedFormats: MergeVideoAndAudioData[] = [];

  yTRequestFormat.formats.video = yTRequestFormat.formats.video.filter(
    (format) => {
      format.videoCodec && format.audioCodec;
    }
  );
  yTRequestFormat.formats.audio = yTRequestFormat.formats.audio.filter(
    (format) => {
      format.audioCodec && format.container == "mp4";
    }
  );

  // ALLOWED_QUALITIES.forEach((quality) => {
  //   // Filter formats to only include those with the target resolution
  //   const targetFormats = yTRequestFormat.formats.video.filter(
  //     (format) =>
  //       format.qualityLabel === quality &&
  //       format.videoCodec &&
  //       format.audioCodec
  //   );

  //   if (targetFormats.length === 0) {
  //     console.log(`No formats available for ${quality} resolution`);
  //     return null;
  //   }
  //   // Sort by bitrate (descending) to get the highest quality
  //   targetFormats.sort((a, b) => {
  //     if (a.contentLength === null || b.contentLength === null) {
  //       return 0; // Handle null cases
  //     }
  //     return Number(b.contentLength) - Number(a.contentLength);
  //   });

  //   // Select the best video format
  //   const bestVideoFormat = targetFormats[0];

  //   let bestAudioFormat: YouTubeVideoFormat | null = null;
  //   let needsMerging = false;

  //   if (bestVideoFormat.audioCodec !== null) {
  //     // The best video format already includes audio
  //     bestAudioFormat = bestVideoFormat;
  //   } else {
  //     needsMerging = true;
  //     // Find the matching audio format
  //     const matchingAudioFormats = yTRequestFormat.formats.audio.find(
  //       (format) => format.container === bestVideoFormat.container
  //     );

  //     if (matchingAudioFormats) {
  //       bestAudioFormat = matchingAudioFormats;
  //     } else {
  //       // If no matching audio format found, fall back to the highest quality audio
  //       yTRequestFormat.formats.audio.sort((a, b) => {
  //         if (a.contentLength === null || b.contentLength === null) {
  //           return 0; // Handle null cases
  //         }
  //         return Number(b.contentLength) - Number(a.contentLength);
  //       });
  //       bestAudioFormat = yTRequestFormat.formats.audio[0];
  //     }
  //   }
  //   sortedFormats.push({
  //     videoFormat: bestVideoFormat,
  //     audioFormat: bestAudioFormat,
  //     needsMerging: needsMerging,
  //     resolution: quality,
  //     estimatedDownloadSize: estimateDownloadSize(
  //       parseInt(bestVideoFormat.contentLength ?? "") ?? 0,
  //       parseFloat(bestAudioFormat.contentLength ?? "0") ?? 0
  //     ),
  //   });
  // });

  return sortedFormats;
};

/**
 * Downloads a video and an audio file and merges them into a single file.
 *
 * @param videoUrl The URL of the video file.
 * @param audioUrl The URL of the audio file.
 * @param outputPath The path where the merged video will be saved.
 * @param progressCallback A callback that will be called with the current progress (0-1)
 * @returns The path of the merged video file, or null if an error occurred.
 */
const mergeVideoAndAudio = async (
  videoUrl: string,
  audioUrl: string,
  outputPath: string,
  progressCallback: (progress: number) => void
) => {
  const totalSteps = 3; // Download video, download audio, merge
  let currentStep = 0;

  const updateProgress = (stepProgress: number) => {
    const overallProgress = (currentStep + stepProgress) / totalSteps;
    progressCallback(overallProgress);
  };

  try {
    // Step 1: Download video.........
    currentStep = 0;
    const videoPath = FileSystem.documentDirectory + "temp_video.mp4";
    const videoCallback = (
      downloadProgress: FileSystem.DownloadProgressData
    ) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      updateProgress(progress);
    };
    const videoDownloadResumable = FileSystem.createDownloadResumable(
      videoUrl,
      videoPath,
      {},
      videoCallback
    );
    await videoDownloadResumable.downloadAsync();

    console.log("Finished downloading video");

    // Step 2: Download audio..........
    currentStep = 1;
    const audioPath = FileSystem.documentDirectory + "temp_audio.m4a";
    const audioCallback = (
      downloadProgress: FileSystem.DownloadProgressData
    ) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      updateProgress(progress);
    };
    const audioDownloadResumable = FileSystem.createDownloadResumable(
      audioUrl,
      audioPath,
      {},
      audioCallback
    );
    await audioDownloadResumable.downloadAsync();

    console.log("Finished downloading audio", audioPath);

    // Step 3: Merge video and audio........
    currentStep = 2;
    console.log("Merging video and audio");
    console.log(
      `-i ${videoPath} -i ${audioPath} -c:v copy -c:a aac ${outputPath}`
    );

    const command = `-i ${videoPath} -i ${audioPath} -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 ${outputPath}`;
    const result = await FFmpegKit.execute(command);
    console.log(result.getReturnCode());
    // await FFmpegKit.executeAsync(
    //   command,
    //   async (session) => {
    //     console.log("FFmpeg process started------");
    //     const returnCode = await session.getReturnCode();
    //     if (ReturnCode.isSuccess(returnCode)) {
    //       console.log("Merging completed");
    //       resolve();
    //     } else {
    //       console.log("Merging failed");
    //       reject(
    //         new Error(`FFmpeg process exited with returnCode ${returnCode}`)
    //       );
    //     }
    //   },
    //   (log) => {
    //     console.log(log.getMessage());
    //   },
    //   (statistics) => {
    //     const progress = statistics.getTime() / 5000;
    //     console.log("Progress: ", progress);
    //     updateProgress(Math.min(progress, 1));
    //   }
    // );

    console.log("Cleaning up temporary files");
    // Clean up temporary files.....
    await FileSystem.deleteAsync(videoPath);
    await FileSystem.deleteAsync(audioPath);
    progressCallback(1); // Ensure we end at 100%
    return outputPath;
  } catch (error) {
    console.error("Error in video processing:", error);
    return null;
  }
};

/**
 * Downloads and processes a YouTube video.
 * @param title The title of the video.
 * @param format An object containing the video and audio formats of the video.
 * @param targetResolution The target resolution of the video.
 * @param progressCallback A callback for reporting progress of the download.
 * @returns The path of the downloaded and processed video, or null if an error occurred.
 */
export const downloadAndProcessYouTubeVideo = async (
  title: string,
  format: MergeVideoAndAudioData,
  progressCallback: (progress: number) => void
): Promise<string | null> => {
  try {
    const videoPath =
      "file:///data/user/0/host.exp.exponent/files/temp_video.mp4";
    const audioPath =
      "file:///data/user/0/host.exp.exponent/files/temp_audio.m4a";
    const outputPath =
      "file:///data/user/0/host.exp.exponent/files/output_144p.mp4";
    const session = await FFmpegKit.executeWithArguments([
      "-i",
      videoPath,
      "-i",
      audioPath,
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-shortest",
      outputPath,
    ]);

    const state = await FFmpegKitConfig.sessionStateToString(
      await session.getState()
    );
    const returnCode = await session.getReturnCode();

    if (state === "Session completed" && ReturnCode.isSuccess(returnCode)) {
      console.log("Merge successful!");
    } else {
      console.error("Merge failed:", state, returnCode);
    }

    console.log("Cleaning up temporary files");
    // const { videoFormat, audioFormat, needsMerging } = format;

    // if (needsMerging) {
    //   const outputPath =
    //     FileSystem.documentDirectory + `output_${format.resolution}.mp4`;
    //   return await mergeVideoAndAudio(
    //     videoFormat.url,
    //     audioFormat.url,
    //     outputPath,
    //     progressCallback
    //   );
    // }
    // // If no merging is needed, just download the video
    // const videoPath =
    //   FileSystem.documentDirectory +
    //   `${title}_${format.resolution}.${videoFormat.container}`;

    // const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
    //   const progress =
    //     downloadProgress.totalBytesWritten /
    //     downloadProgress.totalBytesExpectedToWrite;
    //   progressCallback(progress * 100);
    // };

    // const downloadResumable = FileSystem.createDownloadResumable(
    //   videoFormat.url,
    //   videoPath,
    //   {},
    //   callback
    // );
    // const result = await downloadResumable.downloadAsync();
    // console.log("Finished downloading to ", result?.uri);

    // return videoPath;
    return null;
  } catch (error) {
    console.error("Error in video download and processing:", error);
    FFmpegKit.cancel();
    return null;
  }
};

const bytesToMB = (bytes: number) => {
  return (bytes / (1024 * 1024)).toFixed(2);
};

export const estimateDownloadSize = (
  videoFileSize: number,
  audioFileSize: number
) => {
  return bytesToMB(videoFileSize + audioFileSize);
};

const FAKERESULT = {
  title: "Sabrina - My Africa (Official Lyrics Video)",
  thumbnail: "https://i.ytimg.com/vi_webp/Vzqist3c7w4/sddefault.webp",
  formats: {
    video: [
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ez6vHKVYv1creXa2FqbQZB536IUSzAY6_vELVaSknM8k111VQ7XLjhE7Bth-Q7xcoYEcFtlDkkV&spc=Mv1m9k5cYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWKLBY&vprv=1&svpuc=1&mime=video%2Fmp4&ns=xAem1BndL6jAuiTVLzN3ibcQ&rqh=1&gir=yes&clen=14351035&ratebypass=yes&dur=162.725&lmt=1706642987976818&mt=1725521806&fvip=3&c=WEB_CREATOR&sefc=1&txp=4538434&n=M6-rDe74YeoQ8A&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRQIhALQZi4XBcao2YrkODgWvKtmZWA0jSBCADdJ8q5S9wKZTAiAz2ZSXL2TV9WyYdKizeesIFY83CjOkqap3r0CpcM-ASg%3D%3D",
        itag: 18,
        container: "mp4",
        videoCodec: "avc1.42001E",
        audioCodec: "avc1.42001E",
        contentLength: "14351035",
        qualityLabel: "360p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=137&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=51731390&dur=162.666&lmt=1706645536848399&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4535434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRQIhAKTIMgZLe6ethHq_6EXld7miTTU6cCWrR1yXQldBJfwoAiAm27pWQxH5a32ZZHq5b194oDVPPYQwx73BpAvsjGhy2Q%3D%3D",
        itag: 137,
        container: "mp4",
        videoCodec: "avc1.640028",
        audioCodec: null,
        contentLength: "51731390",
        qualityLabel: "1080p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=248&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fwebm&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=40530727&dur=162.666&lmt=1706643620731709&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4535434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRAIgPKoIg3EC3qkxZ7UU6_1zMl-COtoMNhJAPTcwbR1idUICIEJJrJa3XkfI8pvQ52zgosnj7D2dkt6PNzji4LXhGZN4",
        itag: 248,
        container: "webm",
        videoCodec: "vp9",
        audioCodec: null,
        contentLength: "40530727",
        qualityLabel: "1080p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=399&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=27465534&dur=162.666&lmt=1706643968907700&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4537434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRgIhAIbTV7qfdLb1prBSXQ0P0LPf935rUwVDLeHOsvyMGSzEAiEArypva9eRN2tlsWClWWtBDDki7TTWiMaU4vWM5nu0g4M%3D",
        itag: 399,
        container: "mp4",
        videoCodec: "av01.0.08M.08",
        audioCodec: null,
        contentLength: "27465534",
        qualityLabel: "1080p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=136&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=15862664&dur=162.666&lmt=1706645597397480&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4535434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRQIgQvQ2-npnEs7P0CuilL7NsTIpLK1F_MDArxkMwAVMYOMCIQC9USzZbNI7HpbEYHN7sphj5-dpGd0kTznANqf3FlsRcw%3D%3D",
        itag: 136,
        container: "mp4",
        videoCodec: "avc1.4d401f",
        audioCodec: null,
        contentLength: "15862664",
        qualityLabel: "720p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=247&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fwebm&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=15765961&dur=162.666&lmt=1706643677852843&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4535434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRQIgTxq2y0Jgz-Xq6Yyi7v84d6C2eeM7DcLaYDZbBvPYrj4CIQDKeY7_E5mdyO0s7FJ1L7KWnXMCYccdm9jlyrmsfJ0GWg%3D%3D",
        itag: 247,
        container: "webm",
        videoCodec: "vp9",
        audioCodec: null,
        contentLength: "15765961",
        qualityLabel: "720p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=398&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=16225031&dur=162.666&lmt=1706643294177446&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4537434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRQIgaaKPbzmAskZ4OAgARPZhBC78uFQrcVihgNxVeag3ZbECIQD6ON28TW7bCaMNLGrP6qEZhddpgXN48eHPKHlcm1lUpg%3D%3D",
        itag: 398,
        container: "mp4",
        videoCodec: "av01.0.05M.08",
        audioCodec: null,
        contentLength: "16225031",
        qualityLabel: "720p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=244&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fwebm&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=10030832&dur=162.666&lmt=1706643679590462&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4535434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRQIhANWEf31qbLjFAyHgKGEbk8E5-0lQ6dF5iTws29lvOKN-AiAObgeVOcR3YCaX9EG8L4YQSnlIqvz263shJ9f2RaKSOA%3D%3D",
        itag: 244,
        container: "webm",
        videoCodec: "vp9",
        audioCodec: null,
        contentLength: "10030832",
        qualityLabel: "480p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=135&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=8767098&dur=162.666&lmt=1706645597487653&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4535434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRgIhAMvOQuvd3B0GNBUIIZi-AsqdAvQW28OzYGPl1bhbmYg2AiEA3-D8dtlt6ce1fbNPyLJ6MEZk2EA_wZjXNXmjjJ9TII0%3D",
        itag: 135,
        container: "mp4",
        videoCodec: "avc1.4d401e",
        audioCodec: null,
        contentLength: "8767098",
        qualityLabel: "480p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=397&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=9302063&dur=162.666&lmt=1706643749087939&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4537434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRQIgU2veOkWo6a9jnkTr2sjbsMHdmfxE37FEoowW1tmhxqsCIQDeAQYR3PeED8TEHX_cn90cwrP17O1UBtTQkQIO52J4xA%3D%3D",
        itag: 397,
        container: "mp4",
        videoCodec: "av01.0.04M.08",
        audioCodec: null,
        contentLength: "9302063",
        qualityLabel: "480p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=243&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fwebm&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=6982658&dur=162.666&lmt=1706643677652646&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4535434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRAIgI_KpZ01oWc1Avt88IJzyLVJmlqXNq2F7a4_to65Y-owCID2JEDYSL4ycWImDK7Qspv9Z0tlk6xqo4upGEamxGah0",
        itag: 243,
        container: "webm",
        videoCodec: "vp9",
        audioCodec: null,
        contentLength: "6982658",
        qualityLabel: "360p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=134&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=5857299&dur=162.666&lmt=1706645597522454&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4535434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRAIgNGleyEQAf8xFQMNL5snbI1YVj-kdq0OOlsrL6hXPXlICIGMNxN3QsH30_5ZAZoyUcue6o6mZrxD97Vy8PpdkRJKb",
        itag: 134,
        container: "mp4",
        videoCodec: "avc1.4d401e",
        audioCodec: null,
        contentLength: "5857299",
        qualityLabel: "360p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=396&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=5210881&dur=162.666&lmt=1706643023251094&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4537434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRgIhAPVv1Hn8c2UEtG1VGsaFm8y4HZbdIfk38bb1FyKTDuhMAiEAiVBBLq40P1RedUNWOvVuCK7Dsa7_v8QjS_ri1V5r_OM%3D",
        itag: 396,
        container: "mp4",
        videoCodec: "av01.0.01M.08",
        audioCodec: null,
        contentLength: "5210881",
        qualityLabel: "360p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=242&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fwebm&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=4082988&dur=162.666&lmt=1706643677964446&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4535434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRAIgQNVqbBxgtWnDzbiMSyqichmDPMnXi5JX52AVrJ16R8kCIGqrJY0ItqciOO7cwUrlW5KMtbiVVRMR9K4Iikx-8Sqz",
        itag: 242,
        container: "webm",
        videoCodec: "vp9",
        audioCodec: null,
        contentLength: "4082988",
        qualityLabel: "240p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=133&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=3184957&dur=162.666&lmt=1706645597577970&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4535434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRAIgaY0bv2NMFJo5zLLIN1niH2I3cUdLUAVxAZ-DIirKGEgCIDzdfKcwcMjnhYiKOKv6h06XKYW0ihEYAOpxokdpqF60",
        itag: 133,
        container: "mp4",
        videoCodec: "avc1.4d4015",
        audioCodec: null,
        contentLength: "3184957",
        qualityLabel: "240p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=395&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=2742144&dur=162.666&lmt=1706642999257242&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4537434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRgIhAI9ed1bGqaxrmd0_FR3GQKwyCCTnfBPyvRts22nuqy1vAiEAnXIOwghfSONgI8cgsJGfAWSuOPk1eW-BB51B3B2p8M8%3D",
        itag: 395,
        container: "mp4",
        videoCodec: "av01.0.00M.08",
        audioCodec: null,
        contentLength: "2742144",
        qualityLabel: "240p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=160&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=1874250&dur=162.666&lmt=1706645597401419&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4535434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRQIhAMXp_bDtSj5bBtoDg45CbQUdAAYHnWn-0HpraAZ2kfq3AiBUXiQojlAW3V0OQhJ0F11k6ilUCjJfwvaPKMxB_ubTuw%3D%3D",
        itag: 160,
        container: "mp4",
        videoCodec: "avc1.4d400c",
        audioCodec: null,
        contentLength: "1874250",
        qualityLabel: "144p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=278&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fwebm&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=1914603&dur=162.666&lmt=1706643677762086&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4535434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRAIgdZNZ1YXbmXYKJoKvv4kL0Ew6Kxn0WICGkW8_YXdEwS4CIHR0EYRl8YwZVsyG16d4bfYEOhGq9KiPw7cpj6YAOt4q",
        itag: 278,
        container: "webm",
        videoCodec: "vp9",
        audioCodec: null,
        contentLength: "1914603",
        qualityLabel: "144p",
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=394&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=1303596&dur=162.666&lmt=1706642809244324&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4537434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRQIgO5uhusBQ7SFpxJZFQ-zf6JEt371NwsuI1HVW0-uaKX8CIQDtyFCoPkgsvchg9_k8CUYbnjuOnrYZeahU5QRvspi8EQ%3D%3D",
        itag: 394,
        container: "mp4",
        videoCodec: "av01.0.00M.08",
        audioCodec: null,
        contentLength: "1303596",
        qualityLabel: "144p",
      },
    ],
    audio: [
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=251&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=audio%2Fwebm&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=2670629&dur=162.681&lmt=1706642137569920&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4532434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRQIhAJXvLxFNbe1pM7iFJt39INTigNIB6rudmfCMEVn15Y5dAiA0H2z1OKypEnI_k5oI792ZHsPqdoRiIiozH2OpzYdDpw%3D%3D",
        itag: 251,
        container: "webm",
        videoCodec: null,
        audioCodec: "opus",
        contentLength: "2670629",
        qualityLabel: null,
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=audio%2Fmp4&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=2634275&dur=162.725&lmt=1706642127188540&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4532434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRQIgVKDz7SIDIyKXPPynWvdC4IggDZcj3OxtGQRzEU2rad8CIQCg_Nz-X3jeVioaEtB0GRNHgFEi5WJvyC16K13LEj3oSQ%3D%3D",
        itag: 140,
        container: "mp4",
        videoCodec: null,
        audioCodec: "mp4a.40.2",
        contentLength: "2634275",
        qualityLabel: null,
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=250&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=audio%2Fwebm&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=1350003&dur=162.681&lmt=1706642137655176&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4532434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRAIgKqpt9DNdUmfnRkNOzct1egGkhydUJPMPXlVgdHw4GuUCIHOhdL90WzG0I51RHVbToiTiM6Qu0bBBAlXIqV8HvP9n",
        itag: 250,
        container: "webm",
        videoCodec: null,
        audioCodec: "opus",
        contentLength: "1350003",
        qualityLabel: null,
      },
      {
        url: "https://rr2---sn-p5qs7nsk.googlevideo.com/videoplayback?expire=1725544793&ei=-WTZZoOoIq2G6dsPvu-nuQ4&ip=144.91.117.101&id=o-AMXdl2wOYEtL7rb52oEtOhSSxxR4ndlwXfDPOm2PIb2R&itag=249&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=uS&mm=31%2C26&mn=sn-p5qs7nsk%2Csn-a5msenl7&ms=au%2Conr&mv=u&mvi=2&pl=27&bui=AQmm2ewh6FLqyaq4hcYCJpmpH7MDIQOXq9vpLw34wsjZRFjfJh1M2coL339VjeUO3KHINJifSj71L98P&spc=Mv1m9k5fYAa80D9ejp3dBOHNPU0cOuHUH1_xMfz_hGF3iKvSmkWK&vprv=1&svpuc=1&mime=audio%2Fwebm&ns=E3Hou9b1EEotAhHI4LlAS2wQ&rqh=1&gir=yes&clen=1026061&dur=162.681&lmt=1706642137885237&mt=1725521806&fvip=3&keepalive=yes&c=WEB_CREATOR&sefc=1&txp=4532434&n=9IarEoLRXmkT0g&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=ABPmVW0wRQIhAIQZYAbNjFhVXNDqcPO9bKDM0EjkVzbC7Zp7bm9FCioaAiB6Ze7DN0n5BLb6QuSRi6vRkud1vZn4yg2BlzZl9E3d0g%3D%3D&sig=AJfQdSswRgIhANxEDsmHieUMRM8FRRP6pcvRp-nXvYuvKWmOrp6iB6JzAiEAr7WlTLO6nfVAJNtBmaefzk8V6bLfWAVk-AESuFlpA0s%3D",
        itag: 249,
        container: "webm",
        videoCodec: null,
        audioCodec: "opus",
        contentLength: "1026061",
        qualityLabel: null,
      },
    ],
  },
};
