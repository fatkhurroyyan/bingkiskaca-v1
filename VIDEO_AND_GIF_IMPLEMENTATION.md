# Video Recording and GIF Creation Implementation

## Summary of Changes

Your kiosk app now automatically:
1. **Records video** while photos are being taken (starts on first photo, stops after 4th photo)
2. **Creates animated GIF** from the 4 photos with smooth transitions
3. **Saves both** to designated directories automatically

## Files Modified

### Frontend Changes

1. **[src/app/hooks/useWebcam.ts](src/app/hooks/useWebcam.ts)**
   - Added video recording support with MediaRecorder API
   - New functions: `startVideoRecording()`, `stopVideoRecording()`
   - New state: `isRecording`
   - Returns video as Blob format

2. **[src/app/utils/createGif.ts](src/app/utils/createGif.ts)** (NEW FILE)
   - Creates animated GIF from photo array using gif.js library
   - Customizable: width, height, delay between frames, quality
   - Converts Blob to Data URL for transmission

3. **[src/app/components/screens/ShootingScreen.tsx](src/app/components/screens/ShootingScreen.tsx)**
   - Integrated video recording lifecycle
   - Starts recording automatically on first photo countdown
   - Stops recording after 4th photo is captured
   - Creates GIF automatically after all photos collected
   - Displays "Creating animation..." state during GIF generation

4. **[src/app/utils/savePhotos.ts](src/app/utils/savePhotos.ts)**
   - Added `saveVideo()` - saves video Blob via FormData
   - Added `saveGif()` - saves GIF Blob via FormData
   - Updated `saveAllPhotos()` - now accepts optional videoBlob and gifBlob parameters
   - Improved error handling with warnings for individual file failures

5. **[src/app/components/screens/ProcessingScreen.tsx](src/app/components/screens/ProcessingScreen.tsx)**
   - Updated to pass video and GIF blobs to `saveAllPhotos()`
   - Added dependencies for state.recordedVideoBlob and state.recordedGifBlob

6. **[src/app/components/kiosk/KioskContext.tsx](src/app/components/kiosk/KioskContext.tsx)**
   - Added `setRecordedVideoBlob()` function
   - Added `setRecordedGifBlob()` function
   - Stores video/GIF blobs in app state across screens
   - Clears blobs on retake

7. **[src/app/components/kiosk/types.ts](src/app/components/kiosk/types.ts)**
   - Updated KioskState interface with `recordedVideoBlob?` and `recordedGifBlob?` fields

### Backend Changes

1. **[server/index.mjs](server/index.mjs)**
   - Added VIDEO_DIR and GIF_DIR paths pointing to:
     - `Picture/Video/` for recorded videos
     - `Picture/GIF/` for animated WebM
   - Added `parseMultipartForm()` function to handle file uploads
   - Added `saveVideo()` function - saves .webm video files
   - Added `saveGif()` function - saves animated WebM (previously GIF)
    - New endpoints:
      - `POST /api/save/video` - saves recorded video
      - `POST /api/save/gif` - saves animated WebM (previously GIF)

### Dependencies Added

- `gif.js` - Library for creating animated GIFs from images (now fallback/optional)

## How It Works

### Recording Flow
1. User taps "Lanjutkan" after camera preview starts
2. Countdown begins (3, 2, 1...)
3. **Video recording starts automatically** before first photo
4. Flash effect, photo captured
5. User reviews and approves photo
6. Process repeats for photos 2, 3, and 4
7. After photo 4 is approved:
   - Video recording stops
   - WebM animation is created from all 4 photos (600ms delay between frames)
8. Both video and WebM animation are passed through app state to ProcessingScreen

### Saving Flow
1. ProcessingScreen calls `saveAllPhotos()` with:
   - Original photos (4 JPEGs)
   - Strip photo (composed frame)
   - Video blob (WebM format)
   - WebM animation blob (WebM format)
2. API calls are made concurrently:
   - `/api/save/original` → `Picture/Original/{sessionId}-photo-1.jpg` etc.
   - `/api/save/strip` → `Picture/Strip/{sessionId}-strip.jpg`
   - `/api/save/video` → `Picture/Video/{sessionId}-video.webm`
   - `/api/save/gif` → `Picture/GIF/{sessionId}-animation.webm` (saved to GIF folder with .webm extension)

## File Locations

All media files are automatically saved to:
```
d:\BINGKIS KACA APP PROJECT\BINGKIS KACA - figmamake v1 - Copy\Picture\
├── Original/        (Original JPEGs)
├── Strip/          (Strip JPEGs)
├── Video/          (Recorded WebM videos)
└── GIF/            (Animated WebM loops)
```

## Testing Checklist

- [ ] Start the app and go through the photo capture flow
- [ ] Verify video recording starts on countdown before photo 1
- [ ] Check that video file appears in Picture/Video/ directory
- [ ] Verify WebM animation file appears in Picture/GIF/ directory
- [ ] Open the WebM animation in VLC or browser to confirm animation works
- [ ] Test video playback (plays in VLC, Windows Photos, etc.)
- [ ] Test retake functionality - ensure video/GIF blobs are cleared
- [ ] Verify all 4 files (originals, strip, video, animation) are created per session
