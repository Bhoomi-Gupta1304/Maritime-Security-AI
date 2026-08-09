# Maritime-Security-AI

🌊 **AI-Based Underwater Image Enhancement & Threat Detection for Maritime Security**

A full-stack coastal defense and monitoring prototype. Users upload underwater maritime images, which are processed by a YOLOv8-based detection pipeline to flag potential maritime threats. Built with a Node.js/Express backend, MongoDB for user data, and an HTML/CSS/JS frontend (dashboard, live feed, alerts, and upload screens).

> **Status: Prototype / Work in Progress**
> Core auth, upload, and UI flows are functional, but the AI detection pipeline currently has known accuracy and reliability issues (see [Known Issues](#known-issues) below). This project is under active development — see [Roadmap](#roadmap) for planned fixes.

---

## Problem

Underwater surveillance images suffer from low visibility, color distortion, and noise, which leads to missed detection of maritime threats.

## Solution

- A deep learning model enhances underwater images before detection
- YOLOv8 detects potential threats on the enhanced image
- A web dashboard displays logs and alerts from detection results

---

## Features

- **User Authentication** — Register/login backed by MongoDB (Mongoose)
- **Dashboard** — Overview screen for monitoring status
- **Live Feed** — Interface for live/near-real-time monitoring view
- **Image Upload** — Upload underwater images for threat detection
- **AI Detection Pipeline** — YOLOv8 (via a Python script) processes uploaded images and returns detected objects with bounding boxes
- **Alerts** — Surfaces detection results as alerts in the UI

---

## Tech Stack

| Layer      | Technology            |
|------------|------------------------|
| Backend    | Node.js, Express       |
| Database   | MongoDB, Mongoose      |
| Detection  | Python, YOLOv8 (Ultralytics), OpenCV |
| Frontend   | HTML, CSS, JavaScript (static) |

---

## Project Structure

```
.
├── server.js              # Express server, routes (/login, /register, /upload, /detect)
├── detect.py               # YOLOv8 detection script (Python)
├── package.json
├── uploads/                 # Uploaded images and detection outputs
├── login.html
├── register.html
├── dashboard.html
├── upload.html
├── live-feed.html
├── alerts.html
└── README.md
```

*(Adjust to match your actual file/folder layout before pushing.)*

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.9+
- MongoDB instance (local or Atlas)
- `pip` packages: `ultralytics`, `opencv-python`

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/maritime-security-ai.git
cd maritime-security-ai

# Install backend dependencies
npm install

# Install Python dependencies
pip install ultralytics opencv-python
```

### Environment Variables

Create a `.env` file in the project root:

```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

### Running the App

```bash
node server.js
```

Then open `http://localhost:3000` in your browser.

---

## Known Issues

This prototype's detection pipeline is **not yet production-ready**. Known problems currently being worked on:

- **False positives on marine life**: YOLOv8's stock COCO weights have no "fish" class, so fish are sometimes misclassified as unrelated terrestrial/avian classes (e.g. "bird") due to low-confidence guesses.
- **"No objects detected" false negatives**: The `/detect` route parses YOLO's console output from `stdout` to get results. YOLO's own logging output can interfere with this parsing, causing the UI to report no detections even when the model actually drew bounding boxes.
- **No image quality handling**: Blurry or low-contrast underwater images are passed to the model as-is, with no sharpening or contrast correction, which hurts detection accuracy.
- **Concurrent upload collisions**: Uploaded images and detection outputs are currently saved to fixed filenames (`uploads/input.jpg`, `uploads/output.jpg`), so simultaneous uploads from different users can overwrite each other.

If you're evaluating this project: authentication, upload flow, and UI navigation are stable. **Detection accuracy and reliability are the current focus and should not yet be treated as trustworthy output.**

---

## Roadmap

- [ ] Replace stdout-based result parsing with a stable file-based handoff (`uploads/result.json`) between the detection script and the backend
- [ ] Raise YOLO confidence threshold and filter out implausible non-marine classes to reduce false positives
- [ ] Add blur detection (Variance of Laplacian) with automatic sharpening for low-quality frames
- [ ] Add CLAHE-based contrast enhancement for underwater visibility
- [ ] Move from stock COCO weights to a custom-trained model with actual marine/threat classes
- [ ] Generate unique filenames per upload to prevent concurrent-user overwrite issues
- [ ] Add automated tests around the detection pipeline

---

## Contributing

This is an early-stage prototype. Issues and PRs around the detection pipeline (see Roadmap above) are especially welcome.