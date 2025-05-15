'use client'
import { useState } from 'react';
import FormatsList from './FormatsList';

export default function VideoInfo({ data, videoUrl }) {
  const [activeTab, setActiveTab] = useState('video');

  // Helper function to format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = '';
    if (hours > 0) {
      result += hours + ':';
    }
    result += minutes.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
    return result;
  };

  // Helper function to format numbers with commas
  const numberWithCommas = (x) => {
    return x.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
  };

  // Separate video and audio formats
  const uniqueFormats = Array.from(new Map(data.formats.map(format => {
    const key = format.qualityLabel + format.container + (format.hasAudio ? 'audio' : 'noaudio');
    return [key, format];
  })).values());

  const videoWithAudioFormats = uniqueFormats.filter(format => format.hasVideo && format.hasAudio && format.container === 'mp4');
  const videoOnlyFormats = uniqueFormats.filter(format => format.hasVideo && !format.hasAudio && format.container === 'mp4');
  const audioFormats = uniqueFormats.filter(format => !format.hasVideo && format.hasAudio);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row mb-5">
        <div className="w-full md:w-80 mb-5 md:mb-0 md:mr-5">
          <img 
            src={data.thumbnailUrl} 
            alt={data.title} 
            className="w-full rounded"
          />
        </div>
        <div className="flex-1">
          <h2 className="mb-2.5 text-2xl text-[#333]">{data.title}</h2>
          <p className="text-[#666] mb-1.5"><strong>Channel:</strong> {data.author.name}</p>
          <p className="text-[#666] mb-1.5"><strong>Duration:</strong> {formatDuration(data.lengthSeconds)}</p>
          <p className="text-[#666] mb-1.5"><strong>Views:</strong> {numberWithCommas(data.viewCount)}</p>
        </div>
      </div>
      
      <div>
        <div className="flex gap-2.5 mb-4">
          <button 
            className={`px-5 py-2.5 rounded font-semibold cursor-pointer ${
              activeTab === 'video' ? 'bg-[#ff0000] text-white' : 'bg-[#eee] text-[#333]'
            }`}
            onClick={() => setActiveTab('video')}
          >
            Video Formats
          </button>
          <button 
            className={`px-5 py-2.5 rounded font-semibold cursor-pointer ${
              activeTab === 'audio' ? 'bg-[#ff0000] text-white' : 'bg-[#eee] text-[#333]'
            }`}
            onClick={() => setActiveTab('audio')}
          >
            Audio Formats
          </button>
        </div>
        
        {activeTab === 'video' && (
          <div>
            <h3 className="my-5 pb-2.5 border-b border-[#eee] text-[#333]">
              Video Formats with Audio
            </h3>
            <FormatsList formats={videoWithAudioFormats} videoUrl={videoUrl} />
            
            <h3 className="my-5 pb-2.5 border-b border-[#eee] text-[#333]">
              Video Formats without Audio
            </h3>
            <FormatsList formats={videoOnlyFormats} videoUrl={videoUrl} />
          </div>
        )}
        
        {activeTab === 'audio' && (
          <div>
            <h3 className="my-5 pb-2.5 border-b border-[#eee] text-[#333]">
              Available Audio Formats
            </h3>
            <FormatsList formats={audioFormats} videoUrl={videoUrl} />
          </div>
        )}
      </div>
    </div>
  );
}