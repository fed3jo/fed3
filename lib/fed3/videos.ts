export type StationVideoSource = { src: string; mobileSrc?: string; poster?: string; captions?: { src: string; language: 'ar' | 'en'; label: string }[] };

// Use direct video file URLs, not YouTube or Vimeo page URLs. Rebuild after changing these variables.
export const stationVideos = {
  alternatives: {
    src: process.env.NEXT_PUBLIC_FED3_ALTERNATIVES_VIDEO_URL || '/videos/alternatives-v1-720p.mp4',
    mobileSrc: process.env.NEXT_PUBLIC_FED3_ALTERNATIVES_VIDEO_URL || '/videos/alternatives-v1-360p.mp4',
    poster: '/videos/alternatives-v1-poster.webp',
  },
  'home-cloud': {
    src: process.env.NEXT_PUBLIC_FED3_HOME_CLOUD_VIDEO_URL || '/videos/home-cloud-v1-720p.mp4',
    mobileSrc: process.env.NEXT_PUBLIC_FED3_HOME_CLOUD_VIDEO_URL || '/videos/home-cloud-v1-360p.mp4',
    poster: '/videos/home-cloud-v1-poster.webp',
  },
  communities: {
    src: process.env.NEXT_PUBLIC_FED3_COMMUNITIES_VIDEO_URL || '/videos/communities-v1-720p.mp4',
    mobileSrc: process.env.NEXT_PUBLIC_FED3_COMMUNITIES_VIDEO_URL || '/videos/communities-v1-360p.mp4',
    poster: '/videos/communities-v1-poster.webp',
  },
} satisfies Record<string, StationVideoSource>;
