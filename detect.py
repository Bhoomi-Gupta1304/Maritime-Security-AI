import cv2
import numpy as np
from ultralytics import YOLO
import sys
import json

# Constants
BLUR_THRESHOLD = 100
IMPOSSIBLE_CLASSES = [
    'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 
    'giraffe', 'car', 'truck', 'train', 'airplane', 'bicycle', 'motorcycle', 
    'bus', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench'
]

model = YOLO("yolov8n.pt")   # lightweight model

image_path = sys.argv[1]
frame = cv2.imread(image_path)

# Image Enhancement (blur detection & sharpening)
gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

if laplacian_var < BLUR_THRESHOLD:
    # Sharpening
    kernel = np.array([[0, -1, 0], [-1, 5,-1], [0, -1, 0]])
    frame = cv2.filter2D(frame, -1, kernel)

# Apply CLAHE to improve underwater visibility (regardless of blur)
lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
l, a, b = cv2.split(lab)
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
cl = clahe.apply(l)
limg = cv2.merge((cl,a,b))
frame = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

enhanced_path = "uploads/enhanced.jpg"
cv2.imwrite(enhanced_path, frame)

# Predict with verbose=False and high confidence to avoid false positives
results = model(frame, verbose=False, conf=0.5)

detected_items = []

for r in results:
    boxes = r.boxes.xyxy
    confidences = r.boxes.conf
    class_ids = r.boxes.cls

    for box, conf, cls_id in zip(boxes, confidences, class_ids):
        class_name = model.names[int(cls_id)]
        
        # Filter impossible marine classes
        if class_name in IMPOSSIBLE_CLASSES:
            continue
            
        x1, y1, x2, y2 = map(int, box)
        label = f"{class_name} {float(conf):.2f}"
        
        detected_items.append({
            "class_name": class_name,
            "confidence": float(conf),
            "bbox": [x1, y1, x2, y2],
            "label": label
        })

        cv2.rectangle(frame, (x1,y1), (x2,y2), (0,0,255), 2)
        cv2.putText(frame, label, (x1, max(y1 - 10, 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,255), 2)

output_path = "uploads/output.jpg"
cv2.imwrite(output_path, frame)

# Write output to result.json
with open('uploads/result.json', 'w') as f:
    json.dump({
        "output_path": output_path,
        "detected": detected_items
    }, f)