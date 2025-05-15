'use client'
import { useState } from 'react';


export default function SearchForm({ onSubmit }) {
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (videoUrl.trim()) {
      onSubmit(videoUrl.trim());
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <form onSubmit={handleSubmit}>
        <label htmlFor="video-url" className="block mb-2 font-semibold text-[#444]">
          Enter YouTube Video URL
        </label>
        <input
          type="text"
          id="video-url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          required
          className="w-full px-4 py-3 border border-[#ddd] rounded text-base mb-4 focus:outline-none focus:ring-2 focus:ring-youtube-red"
        />
        <button
          type="submit"
          className="bg-youtube-red text-white border-none py-3 px-5 rounded font-semibold text-base cursor-pointer transition-colors hover:bg-youtube-red-dark"
        >
          Get Download Options
        </button>
      </form>
    </div>
  );
}