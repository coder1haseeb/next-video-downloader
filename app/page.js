'use client'
import { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import SearchForm from '@/components/SearchForm';
import VideoInfo from '@/components/VideoInfo';
import Footer from '@/components/Footer';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = async (videoUrl) => {
    console.log("videoUrl")
    console.log(videoUrl)
    setError('');
    setVideoData(null);
    setLoading(true);
    setVideoUrl(videoUrl);
    try {
      const response = await fetch('/api/video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: videoUrl })
      });
      
      const data = await response.json();
      console.log("data")
      console.log(data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video information');
      }
      
      setVideoData(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f9f9f9] text-[#333] leading-relaxed">
      <Head>
        <title>YouTube Video Downloader</title>
        <meta name="description" content="Download YouTube videos in multiple formats" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-[800px] mx-auto p-5">
        <Header />
        
        <SearchForm onSubmit={handleSubmit} />
        
        {error && (
          <div className="bg-[#ffebee] text-[#c62828] p-4 rounded mb-5 font-semibold">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="text-center my-5">
            <div className="w-10 h-10 mx-auto border-4 border-[#f3f3f3] border-t-youtube-red rounded-full animate-spin"></div>
            <p>Fetching video information...</p>
          </div>
        )}
        
        {videoData && <VideoInfo data={videoData} videoUrl={videoUrl} />}
        
        <Footer />
      </div>
    </div>
  );
}