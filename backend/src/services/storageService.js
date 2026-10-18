import { APPROVED_STORAGE_HOSTS } from '../config/constants.js';

export const validateStorageUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') {
    return { valid: false, reason: 'URL is required' };
  }

  let parsed;
  try {
    parsed = new URL(urlStr.trim());
  } catch {
    return { valid: false, reason: 'Malformed URL format' };
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Only secure HTTPS URLs are permitted' };
  }

  const hostname = parsed.hostname.toLowerCase();

  const privateIpPattern = /^(localhost|127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.|0\.|::1|fe80:)/i;
  if (privateIpPattern.test(hostname)) {
    return { valid: false, reason: 'Internal or loopback addresses are prohibited' };
  }

  const isApprovedHost = APPROVED_STORAGE_HOSTS.some(approved => {
    return hostname === approved || hostname.endsWith('.' + approved);
  });

  const isAwsS3 = /^([a-z0-9\-]+\.)?s3[.\-][a-z0-9\-]+\.amazonaws\.com$/i.test(hostname) || hostname === 's3.amazonaws.com';
  const isGoogleCloudStorage = hostname === 'storage.googleapis.com' || hostname.endsWith('.storage.googleapis.com');

  if (!isApprovedHost && !isAwsS3 && !isGoogleCloudStorage) {
    return {
      valid: false,
      reason: `Storage host '${hostname}' is not in the approved providers list (Google Drive, OneDrive, GitHub, Cloudinary, Firebase, AWS S3, Archive.org)`
    };
  }

  return { valid: true, hostname };
};

export const transformStorageUrl = (urlStr) => {
  if (!urlStr) return urlStr;
  const trimmed = urlStr.trim();

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (host === 'drive.google.com') {
      const match = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const fileId = match[1];
        return {
          originalUrl: trimmed,
          downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
          previewUrl: `https://drive.google.com/file/d/${fileId}/preview`
        };
      }
      const idParam = parsed.searchParams.get('id');
      if (idParam) {
        return {
          originalUrl: trimmed,
          downloadUrl: `https://drive.google.com/uc?export=download&id=${idParam}`,
          previewUrl: `https://drive.google.com/file/d/${idParam}/preview`
        };
      }
    }

    if (host === 'github.com' && parsed.pathname.includes('/blob/')) {
      const rawPath = parsed.pathname.replace('/blob/', '/');
      const rawUrl = `https://raw.githubusercontent.com${rawPath}`;
      return {
        originalUrl: trimmed,
        downloadUrl: rawUrl,
        previewUrl: rawUrl
      };
    }

    return {
      originalUrl: trimmed,
      downloadUrl: trimmed,
      previewUrl: trimmed
    };
  } catch {
    return {
      originalUrl: trimmed,
      downloadUrl: trimmed,
      previewUrl: trimmed
    };
  }
};
