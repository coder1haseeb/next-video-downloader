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
    
    // Create proxy agent with cookies support
    const agent = ytdl.createProxyAgent(
      { uri: 'http://122.200.19.103' },
      [] // Empty cookies array, add cookies if needed
    );
    
    const options = {
      agent,
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      },
      timeout: 10000,
      // Add player clients for better compatibility
      playerClients: ["WEB_EMBEDDED", "IOS", "ANDROID", "TV"]
    };

    while (retries > 0) {
      try {
        info = await ytdl.getInfo(url, options);
        break; // Exit loop if successful
      } catch (error) {
        console.error(`Attempt ${4 - retries} failed to get video info:`, error);
        if (
          error.message.includes('Could not extract functions') ||
          error.message.includes('Sign in to confirm you') ||
          error.message.includes('This video is unavailable')
        ) {
          if (retries > 1) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          } else {
            return new Response(
              JSON.stringify({ 
                error: 'Failed to retrieve video information after multiple attempts. Possible bot detection or unavailable video.',
                originalError: error.message 
              }),
              { status: 500 }
            );
          }
        } else {
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

    const formats = info.formats
      .map(format => ({
        itag: format.itag,
        qualityLabel: format.qualityLabel,
        container: format.container,
        hasAudio: format.hasAudio,
        hasVideo: format.hasVideo,
        contentLength: format.contentLength,
        fps: format.fps,
      }))
      .filter(format => format.hasVideo)
      .sort((a, b) => {
        const getResolution = (format) => {
          const label = format.qualityLabel;
          if (!label) return 0;
          const match = label.match(/(\d+p)/);
          return match ? parseInt(match[1]) : 0;
        };
        const resA = getResolution(a);
        const resB = getResolution(b);

        if (resA === resB) {
          if (a.hasAudio && !b.hasAudio) return -1;
          if (!a.hasAudio && b.hasAudio) return 1;
          return 0;
        }
        return resB - resA;
      });

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
        detailedError: error.message,
      }),
      {
        status: 500,
      }
    );
  }
}
