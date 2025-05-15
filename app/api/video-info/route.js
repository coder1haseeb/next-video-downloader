import ytdl from 'ytdl-core';

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
    
    // Get video info with retries
    let info;
    let retries = 3;
    while (retries > 0) {
      try {
        info = await ytdl.getInfo(url);
        break;
      } catch (err) {
        if (err.message.includes('Could not extract functions') && retries > 1) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }
        throw err;
      }
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
        fps: format.fps
      }))
      .sort((a, b) => {
        // Sort by quality (higher resolution first)
        const getHeight = (format) => {
          if (!format.qualityLabel) return 0;
          const match = format.qualityLabel.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        return getHeight(b) - getHeight(a);
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
    return new Response(JSON.stringify({ error: 'Failed to fetch video information' }), {
      status: 500
    });
  }
}