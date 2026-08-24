# HAMS

HAMS is a small browser-based gesture game that I built as a student project while experimenting with JavaScript, computer vision, MediaPipe and real-time webcam interaction.

The idea is simple: perform a specific gesture in front of the camera, let HAMS recognize it, and get a point when the correct gesture is detected.

## About

HAMS uses the webcam to detect hand and facial gestures in real time.

MediaPipe is used to extract hand and face landmarks, and JavaScript processes these landmarks to determine which gesture the player is making.

Once a gesture is detected, the corresponding animation is displayed and the score is updated.

## Current Gestures

| Gesture           | Detection |
| ----------------- | --------- |
| Happy             | Face      |
| Open Mouth        | Face      |
| Tongue            | Face      |
| Lipstick / Pucker | Face      |
| OK / Thumbs Up    | Hand      |
| Nerd              | Hand      |
| Heart             | Two Hands |

The objective is to perform all available gestures and reach the maximum score.

## Features

* Real-time webcam input
* Hand gesture recognition
* Facial gesture recognition
* MediaPipe hand and face landmark detection
* Animated GIF responses
* Intro and game music
* Score tracking
* Gesture state management
* Browser-based gameplay
* Lightweight local setup

## Technologies

The project uses:

* HTML5
* CSS3
* JavaScript
* Python
* MediaPipe Hands
* MediaPipe Face Mesh
* Web Camera API
* HTML5 Video
* HTML5 Audio

Python is currently used to run a simple local HTTP server. The actual gesture detection is performed in the browser using JavaScript and MediaPipe.

## Project Structure

```text
hams/
│
├── web/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── hams.mp4
│   │
│   ├── images/
│   │   ├── normal.gif
│   │   ├── happy.gif
│   │   ├── openmouth.gif
│   │   ├── tongue.gif
│   │   ├── kiss.gif
│   │   ├── okay.gif
│   │   ├── nerd.gif
│   │   └── ruj.gif
│   │
│   └── music/
│       ├── intro.mp3
│       └── game.mp3
│
├── .gitignore
└── README.md
```

## Running Locally

Clone the repository:

```bash
git clone https://github.com/micooeyll/hams.git
cd hams
```

Start the local HTTP server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/web/
```

Allow the browser to access the camera and press the Start button.

## Camera Permission

HAMS requires webcam access because gesture recognition is performed using the camera.

For the local version:

1. Start the Python HTTP server.
2. Open the game in a modern browser.
3. Allow camera access.
4. Press Start.
5. Perform the required gestures in front of the camera.

Chrome or Edge is recommended.

## How Gesture Detection Works

The webcam image is processed by MediaPipe.

MediaPipe detects landmarks for the hands and face. HAMS then uses the positions and distances between these landmarks to determine the current gesture.

The general flow is:

```text
Webcam
   |
   v
MediaPipe
   |
   v
Landmark Detection
   |
   v
Gesture Classification
   |
   v
Game State
   |
   v
Animation + Score
```

For hand gestures, the application checks the relative positions of the fingers and hand landmarks.

For facial gestures, it uses facial landmarks around the mouth and compares measurements such as mouth width and mouth opening.

## Why I Built It

I wanted to build something different from a typical beginner web project.

Instead of making another basic CRUD application, I wanted to experiment with real-time interaction and computer vision in the browser.

While working on HAMS, I learned more about:

* MediaPipe
* Webcam APIs
* Real-time browser processing
* JavaScript game logic
* Facial landmark detection
* Hand landmark detection
* Performance optimization
* Handling browser audio and video

The project also helped me understand some of the practical problems that come with real-time computer vision, especially performance and gesture detection accuracy.

## Current Limitations

Gesture detection is not perfect and can depend on:

* Lighting conditions
* Camera quality
* Distance from the camera
* Hand position
* Face angle
* Camera angle
* Individual differences between users

Some gesture thresholds may need further tuning to improve reliability across different devices and users.

## Future Improvements

Some features I would like to add in the future:

* More gestures
* More accurate gesture classification
* Better performance optimization
* More animations
* Difficulty levels
* High-score system
* Additional game modes
* Better mobile browser support
* Multiplayer functionality

## Project Status

HAMS is currently a small experimental/student project.

The main gameplay and gesture detection system are working, and the project is mainly being used to experiment with browser-based computer vision and real-time interaction.

## Author

Eylul Miçooğulları

GitHub:

https://github.com/micooeyll

## License

This project was created mainly for learning and experimentation.

You are free to explore the source code and use it as a reference for your own projects.
