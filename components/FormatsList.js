export default function FormatsList({ formats, videoUrl }) {

    if (!formats || formats.length === 0) {
      return <p className="text-[#666] italic">No formats available.</p>;
    }
    console.log("videoUrl in formats list")
    console.log(videoUrl)
  
    return (
      <ul className="list-none">
        {formats.map((format) => (
          <li key={format.itag} className="bg-[#f9f9f9] mb-2 p-4 rounded flex justify-between items-center hover:bg-[#f0f0f0] transition-colors">
            <div className="flex-1">
              <strong>
                {format.qualityLabel || 'Audio Only'}
              </strong> - {format.container.toUpperCase()}
              {format.hasVideo && ` (${format.hasAudio ? 'With' : 'No'} Audio)`}
              {format.fps ? ` ${format.fps}fps` : ''}
            </div>
            <a
              href={`http://localhost:3001/api/download?url=${videoUrl ? encodeURIComponent(videoUrl) : ''}&itag=${format.itag}`}
              className="bg-download-green text-white border-none py-2 px-4 rounded font-semibold transition-colors hover:bg-download-green-dark no-underline"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    );
  }