import cv2
import numpy as np
import mediapipe as mp
import imageio

print("HAMS PRO BASLADI 🔥")

# ================= MEDIAPIPE =================
mp_face = mp.solutions.face_mesh
mp_hands = mp.solutions.hands

face_mesh = mp_face.FaceMesh()
hands = mp_hands.Hands()

# ================= GIFLER =================
gifs = {
    "normal": imageio.mimread("images/normal.gif"),
    "happy": imageio.mimread("images/happy.gif"),
    "open": imageio.mimread("images/openmouth.gif"),
    "kiss": imageio.mimread("images/kiss.gif"),
    "tongue": imageio.mimread("images/tongue.gif"),
    "okay": imageio.mimread("images/okay.gif"),
    "nerd": imageio.mimread("images/nerd.gif"),
}

idx = {k: 0 for k in gifs}

# ================= START SCREEN =================
language = None

def click_event(event, x, y, flags, param):
    global language
    if event == cv2.EVENT_LBUTTONDOWN:
        # START butonu
        if 150 < x < 350 and 200 < y < 300:
            language = "EN"
        # BASLA butonu
        if 450 < x < 650 and 200 < y < 300:
            language = "TR"

cv2.namedWindow("START")
cv2.setMouseCallback("START", click_event)

while language is None:
    screen = 255 * np.ones((500, 800, 3), dtype="uint8")

    cv2.putText(screen, "Find Mimics", (250,100),
                cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0,0,0), 3)

    # START button
    cv2.rectangle(screen, (150,200), (350,300), (0,200,0), -1)
    cv2.putText(screen, "START", (180,260),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,255), 2)

    # BASLA button
    cv2.rectangle(screen, (450,200), (650,300), (200,0,0), -1)
    cv2.putText(screen, "BASLA", (480,260),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,255), 2)

    cv2.imshow("START", screen)

    if cv2.waitKey(1) == 27:
        exit()

cv2.destroyWindow("START")

# ================= CAMERA =================
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

# ================= COUNTER =================
score = 0
seen = set()

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    face_result = face_mesh.process(rgb)
    hand_result = hands.process(rgb)

    status = "normal"
    mouth = 0.0

    # ===== FACE =====
    if face_result.multi_face_landmarks:
        for face in face_result.multi_face_landmarks:

            top = face.landmark[13]
            bottom = face.landmark[14]
            mouth = abs(top.y - bottom.y)

            if mouth > 0.06:
                status = "tongue"
            elif 0.032 < mouth < 0.06:
                status = "open"
            elif 0.02 < mouth < 0.032:
                status = "happy"
            elif 0.09 < mouth < 0.013:
                status = "kiss" 
            

    # ===== HAND =====
    if hand_result.multi_hand_landmarks:
        for hand in hand_result.multi_hand_landmarks:

            lm = hand.landmark

            thumb = lm[4]
            index = lm[8]

            # OKAY
            if abs(thumb.x - index.x) < 0.03:
                status = "okay"

            # NERD
            elif (lm[8].y < lm[6].y and
                  lm[12].y > lm[10].y and
                  lm[16].y > lm[14].y and
                  lm[20].y > lm[18].y):
                status = "nerd"

            # ❤️ HEART (2 el)
            if hand_result.multi_hand_landmarks and len(hand_result.multi_hand_landmarks) == 2:

                hand1 = hand_result.multi_hand_landmarks[0].landmark
                hand2 = hand_result.multi_hand_landmarks[1].landmark

                 # iki elin index finger uçları
                index1 = hand1[8]
                index2 = hand2[8]

                # iki elin başparmak uçları
                thumb1 = hand1[4]
                thumb2 = hand2[4]

                # mesafe hesapla
                index_dist = abs(index1.x - index2.x)
                thumb_dist = abs(thumb1.x - thumb2.x)

                # kalp gesture
                if index_dist < 0.08 and thumb_dist < 0.08:
                    status = "kiss"

    # ===== SCORE =====
    if status not in seen and status != "normal":
        seen.add(status)
        score += 1

    # ===== TEXT =====
    if language == "TR":
        text = f"Figur: {score}/6"
    else:
        text = f"Score: {score}/6"

    cv2.putText(frame, text, (20,40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)

    # ===== GIF =====
    gif = gifs.get(status, gifs["normal"])
    idx[status] = (idx[status] + 1) % len(gif)
    gif_frame = gif[idx[status]]

    gif_frame = cv2.cvtColor(gif_frame, cv2.COLOR_RGB2BGR)
    gif_frame = cv2.resize(gif_frame, (frame.shape[1], frame.shape[0]))

    combined = cv2.hconcat([frame, gif_frame])

    cv2.imshow("HAMS PRO 😎", combined)

    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()
