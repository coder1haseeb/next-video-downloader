import ytdl from '@distube/ytdl-core';

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'Video URL is required' }), {
        status: 400
      });
    }

    if (!ytdl.validateURL(url)) {
      return new Response(JSON.stringify({ error: 'Invalid YouTube URL' }), {
        status: 400
      });
    }

    // Get video info with retries and error handling
    let info;
    let retries = 3;
    const retryDelay = 1000; // 1 second delay
    const PROXY_URI = 'http://122.200.19.103';
    const AGENT = ytdl.createProxyAgent({ uri: PROXY_URI });
    
    const options = {
      agent: AGENT,
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          // 'Connection': 'keep-alive' //  Consider adding this, but test carefully
        }
      },
      //  Add this to simulate browser behavior more closely
      //  We're setting the request timeout to be 10 seconds.
      //  This is important because Vercel has limits.
      timeout: 10000,
    };

    while (retries > 0) {
      try {
        info = await ytdl.getInfo(url, options);
        break; // Exit loop if successful
      } catch (error) {
        console.error(`Attempt ${4 - retries} failed to get video info:`, error); // Improved logging
        if (
          error.message.includes('Could not extract functions') ||
          error.message.includes('Sign in to confirm you') || // Explicitly check for the bot error
          error.message.includes('This video is unavailable') // Handle unavailable videos gracefully
        ) {
          if (retries > 1) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue; // Retry
          } else {
            //  Only throw this error after all retries have failed.
            return new Response(
              JSON.stringify({ error: 'Failed to retrieve video information after multiple attempts.  Possible bot detection or unavailable video.',
                               originalError: error.message }), // Include original error
              { status: 500 }
            );
          }
        } else {
           //  If it is not a bot error, and not "could not extract", and not "unavailable",
           //  then it is some other error, and we should NOT retry.  We should
           //  just re-throw it.
          return new Response(JSON.stringify({ error: `Error fetching video info: ${error.message}` }), {
            status: 500
          });
        }
      }
    }

    if (!info) {
       return new Response(JSON.stringify({ error: 'Failed to retrieve video information.' }), {
        status: 500
      });
    }
    // Filter formats to get video and audio formats
    const formats = info.formats
      .map(format => ({
        itag: format.itag,
        qualityLabel: format.qualityLabel,
        container: format.container,
        hasAudio: format.hasAudio,
        hasVideo: format.hasVideo,
        contentLength: format.contentLength,
        fps: format.fps,
        // Add more relevant format properties as needed (e.g., width, height)
      }))
      .filter(format => format.hasVideo) // Important: Filter for formats that *have* video.
      .sort((a, b) => {
        // Sort by quality (higher resolution first)
        const getResolution = (format) => {
          const label = format.qualityLabel;
          if (!label) return 0;
          const match = label.match(/(\d+p)/);  // Extract the number + p
          return match ? parseInt(match[1]) : 0; // Parse the number
        };
        const resA = getResolution(a);
        const resB = getResolution(b);

        if (resA === resB) {
            // If resolutions are the same, prefer formats with audio
            if (a.hasAudio && !b.hasAudio) return -1;
            if (!a.hasAudio && b.hasAudio) return 1;
            return 0; //  Otherwise, keep original order.
        }
        return resB - resA; // High to low
      });

    // Return video details and formats
    return new Response(JSON.stringify({
      title: info.videoDetails.title,
      author: info.videoDetails.author,
      lengthSeconds: parseInt(info.videoDetails.lengthSeconds),
      thumbnailUrl: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      viewCount: info.videoDetails.viewCount,
      formats
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error fetching video info:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch video information',
        detailedError: error.message, // Include the error message for more context
      }),
      {
        status: 500,
      }
    );
  }
}
