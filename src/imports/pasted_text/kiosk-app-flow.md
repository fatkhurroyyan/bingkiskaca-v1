# Role & Context
You are an elite Senior Fullstack Web Developer and UX Architect with Silicon Valley standards. You are building a production-grade Kiosk Web Application for a modern photobooth business named "Bingkis Kaca". The UI/UX must look extremely premium, playful yet clean, utilizing professional multimedia layout standards, smooth typography, and delightful micro-interactions.

# Technology Stack
- Framework: Next.js 14/15 (App Router preference).
- Styling: Tailwind CSS (Modern, vibrant, high-contrast palette suitable for a physical kiosk).
- Animation: Framer Motion (Essential for smooth state transitions between screens).
- Icons: Lucide React.

# Architecture & State Management
Create a single-page interactive kiosk dashboard or a multi-page setup driven by a central State Machine (`currentStep` from 1 to 9). Use React `useState` or a simple Context to handle global data across the flow:
- Chosen Strip/Package (`stripType`, `price`, `allocatedTime`).
- Payment Status (`isPaid`).
- Captured Images array (4 base64 or object URLs).
- Final Compiled Frame URL.
- Transaction Recovery Code.

# Full 9-Screen User Flow Specifications

Please implement all 9 screens inside the Next.js application with the following detailed specifications:

## 1. Welcome Screen
- Layout: Immersive full-screen background with a modern ambient gradient animation (e.g., animate-gradient).
- Content: Large, beautifully animated "Bingkis Kaca" logo in the center. Below it, dynamically display the current active event name (e.g., "SakuBumi Graduation Party 2026").
- Interaction: A blinking, high-visibility call-to-action text: "Sentuh Layar atau Tekan SPASI untuk Mulai". Smooth transition to Step 2 upon interaction.

## 2. Instruksi (Instruction Screen)
- Layout: 3-column clean glassmorphism grid layout.
- Content: 3 simple step-by-step visual cards with modern icons (Lucide React):
  1. "Pilih Paket & Bayar via QRIS/Voucher"
  2. "Gaya Seru 4 Kali Berurutan"
  3. "Scan QR Code untuk Ambil Softfile & Cetak!"
- Interaction: A large, pulsing modern primary button at the bottom: "Saya Siap, Lanjutkan!".

## 3. Strips Selector Screen
- Layout: A visually stunning pricing/package comparison layout.
- Content: Card options for photo strips (e.g., "Classic Double Strip 2x6" or "Full Frame 4R Postcard"). Each card must explicitly list:
  - Package Name and visual placeholder aspect ratio.
  - Price (e.g., Rp 35.000).
  - Allocated Time Limit for the session (e.g., 5 Menit).
- Interaction: Clicking a card saves the selection to the state and automatically progresses to Step 4.

## 4. Payment Screen
- Layout: Split-screen layout (50% Left, 50% Right).
- Left Column: "Pembayaran Instan QRIS". Displays a clear, high-resolution placeholder QRIS code with an animated scanning laser line effect. Add a dummy button "DEBUG: Sukses Bayar" to simulate the backend webhook success trigger.
- Right Column: "Punya Kode Voucher?". A sleek input field for offline vouchers exchanged at the admin booth. Includes a "Verifikasi Voucher" button with loading state.
- Interaction: Upon successful payment/voucher verification, play a green checkmark success animation and proceed to Step 5.

## 5. Time Limit Interstitial Screen
- Layout: High-contrast, dramatic full-screen countdown alert.
- Content: A giant, bold warning message: "Waktu Sesi Anda Dimulai Sekarang!". Displays a large countdown timer preset based on the chosen package from Step 3.
- Interaction: Lasts for exactly 3 seconds automatically using a JavaScript setTimeout before forcing transition into Step 6.

## 6. Pilih Frame -> Preview Screen
- Layout: Interactive design playground. Left side shows a large canvas preview; Right side shows a scrollable carousel grid of available PNG frames.
- Content: Beautiful overlay system. When a user clicks a frame layout design from the carousel, it overlays perfectly on top of a gray silhouette placeholder to give a real-time preview of how the final print layout will look.
- Interaction: "Gunakan Frame Ini" button locked at the bottom right corner to proceed.

## 7. Foto-Foto (The Shooting Engine)
- Layout: Fullscreen mirrored HTML5 Video stream view inside a premium camera-lens styled frame overlay.
- Mechanics (Simulated for Frontend MVP):
  - Run a loop that triggers 4 times sequentially.
  - Before each shot, show a giant overlay countdown (3.. 2.. 1..).
  - On 0, trigger a full-screen white flash animation (`opacity: [0, 1, 0]`) and play a camera shutter sound placeholder effect. Capture the frame and append to the images array.
  - Simultaneously display a subtle indicator: "Recording behind-the-scenes video/GIF...".
- Post-Capture Preview: Display the 4 shots in a 2x2 layout. Give two distinct action buttons: "Retake Foto (Sisa Kesempatan: 1x)" or "Sempurna, Proses Sekarang!".

## 8. Animasi Loading (Processing & Printing)
- Layout: Minimalist, clean, hypnotic cinematic loading screen.
- Content: An exquisite custom multimedia animation (e.g., an architectural blueprint of the photo assembling itself or a photo strip slowly sliding out from a stylized printer slot).
- Text Indicator: Smooth pulsing text changing every few seconds: "Sedang menyelaraskan warna...", "Menempelkan frame Bingkis Kaca...", "Mengirim ke mesin cetak...". Lasts for 4-5 seconds before rendering the final result.

## 9. Scan Soft File Hub (Final Screen)
- Layout: Celebration screen with confetti micro-interactions.
- Center Content: Display the gorgeous final compiled Photo Strip with the selected frame design.
- Sidebar Content:
  - High-visibility QR Code placeholder to scan and download.
  - A clean, copyable short URL text link.
  - A dedicated "Kode Transaksi" card (e.g., BK-2026-9A8X). Add an explicit micro-copy subtext: "Simpan kode ini untuk mengklaim kembali file foto Anda di website jika lupa melakukan scan QR".
- Interaction: A prominent "Selesai & Keluar" button that clears all local state variables and cleanly loops the app back to Step 1.

# Technical Requirements
- Ensure absolute separation of concerns in components.
- Write clean, robust React code. Use beautiful Tailwind CSS gradients (`from-indigo-600 to-purple-600` or custom aesthetic themes), rounded corners (`rounded-2xl/3xl`), and subtle drop shadows for that high-end modern SaaS feel.
- Mock the HTML5 Canvas blending logic inside Step 8 so that it visibly combines the dummy captures with the chosen frame asset into a single unified image reference.