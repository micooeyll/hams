# Real-Time Gesture Recognition System 

A real-time computer vision application that detects facial expressions and hand gestures using webcam input with OpenCV and MediaPipe.

---

## Features

- Real-time facial expression recognition
- Hand gesture detection
- Animated GIF-based visual feedback
- Multilingual interface (TR / EN)
- Interactive webcam processing
- Dynamic score tracking system

---

## Recognized Gestures

- 😊 Smile
- 😮 Open Mouth
- 😘 Kiss Gesture
- 👌 OK Sign
- 🤓 Nerd Gesture
- ❤️ Heart Gesture

---

## Technologies Used

- Python
- OpenCV
- MediaPipe
- NumPy
- ImageIO

---

## How It Works

The application processes webcam frames in real time using MediaPipe Face Mesh and Hand Tracking models. Different facial expressions and hand gestures trigger animated GIF responses dynamically.

---

## Project Structure

```bash
real-time-gesture-recognition/
│
├── images/
│   ├── normal.gif
│   ├── happy.gif
│   ├── openmouth.gif
│   ├── kiss.gif
│   ├── tongue.gif
│   ├── okay.gif
│   └── nerd.gif
│
├── main.py
├── requirements.txt
├── README.md
├── LICENSE
├── demo1
├── demo2
├── demo3
├── demo4
├── demo5
└── .gitignore
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/real-time-gesture-recognition.git
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the project:

```bash
python main.py
```

---

## Demo

```markdown
1- demo1.png - to detect "okay.gif" hand gesture
2- demo2.png - to detect "tongue.gif" face gesture
3- demo3.png - to detect "nerd.gif" hand gesture
4- demo4.png - to detect "normal.gif" face gesture
5- demo5.png - to detect "kiss.gif" hand gesture
```

---

## Future Improvements

- Deep learning-based emotion classification
- Additional gesture support
- Performance optimization
- Docker containerization
- Cloud deployment support

---

## Author

Developed by Hamide Eylül Miçoğulları
