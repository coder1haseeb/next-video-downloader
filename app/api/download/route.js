import ytdl from 'ytdl-core';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const itag = searchParams.get('itag');
    console.log("video url")
    console.log(url)
    
    if (!url || !itag) {
      return new Response('URL and itag are required', { status: 400 });
    }
    
    if (!ytdl.validateURL(url)) {
      return new Response('Invalid YouTube URL', { status: 400 });
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
    
    const format = info.formats.find(f => f.itag.toString() === itag.toString());
    
    if (!format) {
      return new Response('Format not found', { status: 400 });
    }
    
    // Create a sanitized filename
    const sanitizedTitle = info.videoDetails.title
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '_');
    
    // Set appropriate file extension based on format
    const fileExtension = format.container || 'mp4';
    
    // Stream the video
    const stream = ytdl(url, { 
      quality: itag,
      filter: format => format.itag.toString() === itag.toString()
    });
    
    return new Response(stream, {
      headers: {
        'Content-Disposition': `attachment; filename="${sanitizedTitle}.${fileExtension}"`
      }
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return new Response('Failed to download video', { status: 500 });
  }
}

// Configure to prevent response timeout for large files
export const config = {
  api: {
    responseLimit: false,
  },
};