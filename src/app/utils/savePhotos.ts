export interface SavePhotosResult {
  originals: string[];
  strip: string;
  video?: string;
  gif?: string;
  shareUrl?: string;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error ?? 'Failed to save photos');
  }

  return response.json();
}

async function postBlob<T>(url: string, blob: Blob, sessionId: string): Promise<T> {
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('sessionId', sessionId);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error ?? 'Failed to save file');
  }

  return response.json();
}

export async function saveOriginalPhotos(images: string[], sessionId: string): Promise<string[]> {
  const result = await postJson<{ saved: string[] }>('/api/save/original', { images, sessionId });
  return result.saved;
}

export async function saveStripPhoto(image: string, sessionId: string): Promise<{ saved: string; shareUrl: string }> {
  const result = await postJson<{ saved: string; shareUrl: string }>('/api/save/strip', { image, sessionId });
  return result;
}

export async function saveVideo(videoBlob: Blob, sessionId: string): Promise<string> {
  const result = await postBlob<{ saved: string }>('/api/save/video', videoBlob, sessionId);
  return result.saved;
}

export async function saveGif(gifBlob: Blob, sessionId: string): Promise<string> {
  const result = await postBlob<{ saved: string }>('/api/save/gif', gifBlob, sessionId);
  return result.saved;
}

export async function saveAllPhotos(
  originals: string[],
  strip: string,
  sessionId: string,
  videoBlob?: Blob,
  gifBlob?: Blob,
): Promise<SavePhotosResult> {
  const result: SavePhotosResult = {
    originals: [],
    strip: '',
  };

  // Always save originals and strip
  const [savedOriginals, stripResult] = await Promise.all([
    saveOriginalPhotos(originals, sessionId),
    saveStripPhoto(strip, sessionId),
  ]);

  result.originals = savedOriginals;
  result.strip = stripResult.saved;
  result.shareUrl = stripResult.shareUrl;

  // Save video if provided
  if (videoBlob) {
    try {
      result.video = await saveVideo(videoBlob, sessionId);
    } catch (err) {
      console.warn('Failed to save video:', err);
    }
  }

  // Save GIF if provided
  if (gifBlob) {
    try {
      result.gif = await saveGif(gifBlob, sessionId);
    } catch (err) {
      console.warn('Failed to save GIF:', err);
    }
  }

  return result;
}
