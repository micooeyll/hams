/* =========================================================
   HAMS WEB GAME
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const introScreen =
    document.getElementById("introScreen");

const gameScreen =
    document.getElementById("gameScreen");

const startButton =
    document.getElementById("startButton");

const introVideo =
    document.getElementById("introVideo");

const cameraVideo =
    document.getElementById("cameraVideo");

const gifImage =
    document.getElementById("gifImage");

const scoreElement =
    document.getElementById("score");

const statusElement =
    document.getElementById("status");

const introMusic =
    document.getElementById("introMusic");

const gameMusic =
    document.getElementById("gameMusic");


/* =========================================================
   GIFS
========================================================= */

const GIFS = {

    normal: "images/normal.gif",

    happy: "images/happy.gif",

    open: "images/openmouth.gif",

    kiss: "images/kiss.gif",

    tongue: "images/tongue.gif",

    okay: "images/okay.gif",

    nerd: "images/nerd.gif",

    lipstick: "images/ruj.gif"

};


/* =========================================================
   PRELOAD GIFS
========================================================= */

const gifCache = {};

for (const key in GIFS) {

    const image = new Image();

    image.src = GIFS[key];

    gifCache[key] = image;
}


/* =========================================================
   GAME STATE
========================================================= */

let score = 0;

const seen = new Set();

let currentStatus = "normal";

let cameraStream = null;

let hands = null;

let faceMesh = null;

let processing = false;

let frameCounter = 0;

let lastProcessTime = 0;

const PROCESS_INTERVAL = 80;


/* =========================================================
   DISTANCE
========================================================= */

function distance(a, b) {

    const dx =
        a.x - b.x;

    const dy =
        a.y - b.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


/* =========================================================
   HAND HELPERS
========================================================= */

function fingerExtended(
    landmarks,
    tip,
    pip
) {

    return (
        landmarks[tip].y <
        landmarks[pip].y
    );
}


function fingerFolded(
    landmarks,
    tip,
    pip
) {

    return (
        landmarks[tip].y >
        landmarks[pip].y
    );
}


/* =========================================================
   OK GESTURE
========================================================= */
function isOkayGesture(landmarks) {

    const thumbUp =
        landmarks[4].y <
        landmarks[3].y &&
        landmarks[3].y <
        landmarks[2].y;

    const indexDown =
        landmarks[8].y >
        landmarks[6].y;

    const middleDown =
        landmarks[12].y >
        landmarks[10].y;

    const ringDown =
        landmarks[16].y >
        landmarks[14].y;

    const pinkyDown =
        landmarks[20].y >
        landmarks[18].y;

    return (
        thumbUp &&
        indexDown &&
        middleDown &&
        ringDown &&
        pinkyDown
    );
}

/* =========================================================
   NERD GESTURE
========================================================= */

function isNerdGesture(landmarks) {

    if (!landmarks || landmarks.length < 21) {
        return false;
    }

    const indexUp =
        fingerExtended(
            landmarks,
            8,
            6
        );

    const middleDown =
        fingerFolded(
            landmarks,
            12,
            10
        );

    const ringDown =
        fingerFolded(
            landmarks,
            16,
            14
        );

    const pinkyDown =
        fingerFolded(
            landmarks,
            20,
            18
        );


    return (
        indexUp &&
        middleDown &&
        ringDown &&
        pinkyDown
    );
}


/* =========================================================
   LIPSTICK / PUCKER
========================================================= */

function isLipstickGesture(face) {

    const left = face[61];
    const right = face[291];

    const upper = face[13];
    const lower = face[14];

    const faceLeft = face[234];
    const faceRight = face[454];

    const mouthWidth = Math.hypot(
        left.x - right.x,
        left.y - right.y
    );

    const mouthHeight = Math.hypot(
        upper.x - lower.x,
        upper.y - lower.y
    );

    const faceWidth = Math.hypot(
        faceLeft.x - faceRight.x,
        faceLeft.y - faceRight.y
    );

    if (faceWidth < 0.01) {
        return false;
    }

    const mouthWidthRatio =
        mouthWidth / faceWidth;

    const mouthHeightRatio =
        mouthHeight / faceWidth;

    return (
        mouthWidthRatio < 0.32 &&
        mouthHeightRatio < 0.075
    );
}

/* =========================================================
   HEART / KISS
========================================================= */

function isHeartGesture(
    hand1,
    hand2
) {

    if (
        !hand1 ||
        !hand2 ||
        hand1.length < 21 ||
        hand2.length < 21
    ) {

        return false;
    }


    const indexDistance =
        distance(
            hand1[8],
            hand2[8]
        );


    const thumbDistance =
        distance(
            hand1[4],
            hand2[4]
        );


    const palm1 =
        distance(
            hand1[0],
            hand1[9]
        );


    const palm2 =
        distance(
            hand2[0],
            hand2[9]
        );


    const palm =
        (
            palm1 +
            palm2
        ) / 2;


    if (palm <= 0) {
        return false;
    }


    return (
        indexDistance / palm < 0.65 &&
        thumbDistance / palm < 0.70
    );
}


/* =========================================================
   HAND CLASSIFICATION
========================================================= */

function detectHandGesture(results) {

    if (
        !results ||
        !results.multiHandLandmarks ||
        results.multiHandLandmarks.length === 0
    ) {

        return null;
    }


    const handsFound =
        results.multiHandLandmarks;


    if (
        handsFound.length === 2 &&
        isHeartGesture(
            handsFound[0],
            handsFound[1]
        )
    ) {

        return "kiss";
    }


    for (
        const landmarks of handsFound
    ) {

        if (
            isOkayGesture(
                landmarks
            )
        ) {

            return "okay";
        }
    }


    for (
        const landmarks of handsFound
    ) {

        if (
            isNerdGesture(
                landmarks
            )
        ) {

            return "nerd";
        }
    }


    return null;
}


/* =========================================================
   FACE CLASSIFICATION
========================================================= */

function detectFaceGesture(results) {

    if (
        !results.multiFaceLandmarks ||
        results.multiFaceLandmarks.length === 0
    ) {
        return null;
    }

    const face =
        results.multiFaceLandmarks[0];

    if (isLipstickGesture(face)) {
        return "lipstick";
    }

    const mouthOpening = Math.abs(
        face[13].y -
        face[14].y
    );

    if (mouthOpening > 0.06) {
        return "tongue";
    }

    if (mouthOpening > 0.032) {
        return "open";
    }

    if (mouthOpening > 0.020) {
        return "happy";
    }

    return null;
}

/* =========================================================
   CHANGE STATUS
========================================================= */

function setStatus(status) {

    if (!status) {

        status = "normal";
    }


    if (
        status === currentStatus
    ) {

        return;
    }


    currentStatus =
        status;


    if (gifCache[status]) {

        gifImage.src =
            gifCache[status].src;
    }


    statusElement.textContent =
        status.toUpperCase();


    if (
        status !== "normal" &&
        !seen.has(status)
    ) {

        seen.add(status);

        score++;


        scoreElement.textContent =
            `SCORE ${score}/6`;
    }
}


/* =========================================================
   MEDIAPIPE HANDS
========================================================= */

function initializeHands() {

    if (
        typeof Hands ===
        "undefined"
    ) {

        console.error(
            "MediaPipe Hands could not load."
        );

        return;
    }


    hands =
        new Hands({

            locateFile: function(file) {

                return (
                    "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" +
                    file
                );
            }

        });


    hands.setOptions({

        maxNumHands: 2,

        modelComplexity: 0,

        minDetectionConfidence: 0.50,

        minTrackingConfidence: 0.50

    });


    hands.onResults(
        onHandsResults
    );
}


/* =========================================================
   MEDIAPIPE FACE
========================================================= */

function initializeFaceMesh() {

    if (
        typeof FaceMesh ===
        "undefined"
    ) {

        console.error(
            "MediaPipe Face Mesh could not load."
        );

        return;
    }


    faceMesh =
        new FaceMesh({

            locateFile: function(file) {

                return (
                    "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/" +
                    file
                );
            }

        });


    faceMesh.setOptions({

        maxNumFaces: 1,

        refineLandmarks: false,

        minDetectionConfidence: 0.50,

        minTrackingConfidence: 0.50

    });


    faceMesh.onResults(
        onFaceResults
    );
}


/* =========================================================
   RESULTS
========================================================= */

let lastHandGesture = null;

let lastFaceGesture = null;


function onHandsResults(results) {

    lastHandGesture =
        detectHandGesture(
            results
        );
}


function onFaceResults(results) {

    lastFaceGesture =
        detectFaceGesture(
            results
        );
}


/* =========================================================
   PROCESS CAMERA
========================================================= */

async function processCamera() {

    if (
        !cameraStream ||
        cameraVideo.readyState < 2
    ) {

        requestAnimationFrame(
            processCamera
        );

        return;
    }


    const now =
        performance.now();


    if (
        processing ||
        now - lastProcessTime <
        PROCESS_INTERVAL
    ) {

        requestAnimationFrame(
            processCamera
        );

        return;
    }


    lastProcessTime =
        now;


    processing = true;


    try {

        if (hands) {

            await hands.send({
                image: cameraVideo
            });
        }


        frameCounter++;


        if (
            faceMesh &&
            frameCounter % 2 === 0
        ) {

            await faceMesh.send({
                image: cameraVideo
            });
        }


        let gesture = null;


        if (lastHandGesture) {

            gesture =
                lastHandGesture;

        } else if (lastFaceGesture) {

            gesture =
                lastFaceGesture;

        } else {

            gesture =
                "normal";
        }


        setStatus(
            gesture
        );

    }

    catch (error) {

        console.error(
            "MediaPipe error:",
            error
        );

    }


    processing = false;


    requestAnimationFrame(
        processCamera
    );
}


/* =========================================================
   CAMERA
========================================================= */

async function startCamera() {

    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    width: {
                        ideal: 640
                    },

                    height: {
                        ideal: 480
                    },

                    frameRate: {
                        ideal: 24,
                        max: 30
                    },

                    facingMode:
                        "user"

                },

                audio: false

            });


        cameraVideo.srcObject =
            cameraStream;


        cameraVideo.style.transform =
            "scaleX(-1)";


        cameraVideo.style.objectFit =
            "cover";


        await cameraVideo.play();


        console.log(
            "Camera started"
        );

    }

    catch (error) {

        console.error(
            "Camera error:",
            error
        );


        alert(
            "Camera permission is required to play HAMS."
        );
    }
}


/* =========================================================
   START GAME
========================================================= */

async function startGame() {

    if (
        !gameScreen.classList.contains(
            "hidden"
        )
    ) {

        return;
    }


    introMusic.pause();

    introMusic.currentTime = 0;


    introScreen.classList.add(
        "hidden"
    );


    gameScreen.classList.remove(
        "hidden"
    );


    await startCamera();


    if (!hands) {

        initializeHands();
    }


    if (!faceMesh) {

        initializeFaceMesh();
    }


    try {

        gameMusic.currentTime = 0;

        await gameMusic.play();

    }

    catch (error) {

        console.warn(
            "Game music could not start:",
            error
        );
    }


    requestAnimationFrame(
        processCamera
    );
}


/* =========================================================
   EXIT GAME
========================================================= */

function exitGame() {

    if (cameraStream) {

        for (
            const track of
            cameraStream.getTracks()
        ) {

            track.stop();
        }


        cameraStream =
            null;
    }


    cameraVideo.srcObject =
        null;


    gameMusic.pause();

    gameMusic.currentTime =
        0;


    gameScreen.classList.add(
        "hidden"
    );


    introScreen.classList.remove(
        "hidden"
    );


    introVideo.currentTime =
        0;


    introVideo.play()
        .catch(function() {});


    introMusic.currentTime =
        0;


    introMusic.play()
        .catch(function() {});


    lastHandGesture =
        null;

    lastFaceGesture =
        null;

    currentStatus =
        "normal";
}


/* =========================================================
   START BUTTON
========================================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        function() {

            startGame();

        }
    );
}


/* =========================================================
   INTRO MUSIC
========================================================= */

document.addEventListener(
    "click",
    function() {

        if (
            introScreen &&
            !introScreen.classList.contains(
                "hidden"
            )
        ) {

            introMusic.play()
                .catch(function() {});

        }

    },
    {
        once: true
    }
);


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            event.preventDefault();

            exitGame();

            return;
        }


        if (
            introScreen &&
            !introScreen.classList.contains(
                "hidden"
            ) &&
            (
                event.key === "Enter" ||
                event.key === " "
            )
        ) {

            event.preventDefault();

            startGame();
        }

    }
);


/* =========================================================
   INITIAL
========================================================= */

if (gifImage) {

    gifImage.src =
        GIFS.normal;
}


if (statusElement) {

    statusElement.textContent =
        "NORMAL";
}


if (scoreElement) {

    scoreElement.textContent =
        "SCORE 0/6";
}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.startGame =
    startGame;

window.exitGame =
    exitGame;

window.startCamera =
    startCamera;

window.isOkayGesture =
    isOkayGesture;

window.isLipstickGesture =
    isLipstickGesture;

console.log(
    "HAMS app.js loaded successfully"
);