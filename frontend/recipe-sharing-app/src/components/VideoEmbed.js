import React from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * VideoEmbed renders an embedded player for YouTube, TikTok or Instagram.
 * Pass a URL (copied from the share link). If it cannot be parsed, nothing is rendered.
 */
export default function VideoEmbed({ url, style, height }) {
  if (!url) return null;

  // YouTube patterns
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) {
    const src = `https://www.youtube.com/embed/${yt[1]}?rel=0&playsinline=1`;
    const containerStyle = height ? { width: '100%', height } : { width: '100%', aspectRatio: 16 / 9 };
    return (
      <View style={[containerStyle, style]}>
        {Platform.OS === 'web' ? (
          <iframe src={src} width="100%" height="100%" style={{ border: 0 }} allowFullScreen />
        ) : (
          <WebView source={{ uri: src }} style={{ flex: 1 }} allowsInlineMediaPlayback />
        )}
      </View>
    );
  }

  // TikTok patterns
  const tt = url.match(/tiktok\.com\/.+\/video\/(\d+)/);
  if (tt) {
    const src = `https://www.tiktok.com/embed/${tt[1]}`;
    const containerStyleTT = height ? { width: '100%', height } : { width: '100%', aspectRatio: 9 / 16 };
    return (
      <View style={[containerStyleTT, style]}>
        {Platform.OS === 'web' ? (
          <iframe src={src} width="100%" height="100%" style={{ border: 0 }} allowFullScreen />
        ) : (
          <WebView source={{ uri: src }} style={{ flex: 1 }} allowsInlineMediaPlayback />
        )}
      </View>
    );
  }

  // Instagram patterns
  const ig = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  if (ig) {
    const src = `https://www.instagram.com/p/${ig[1]}/embed`;
    const containerStyleIG = height ? { width: '100%', height } : { width: '100%', aspectRatio: 1 };
    return (
      <View style={[containerStyleIG, style]}>
        {Platform.OS === 'web' ? (
          <iframe src={src} width="100%" height="100%" style={{ border: 0 }} allowTransparency title="Instagram embed" />
        ) : (
          <WebView source={{ uri: src }} style={{ flex: 1 }} allowsInlineMediaPlayback />
        )}
      </View>
    );
  }

  // Unknown service
  return null;
} 