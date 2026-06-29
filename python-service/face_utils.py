import face_recognition
import numpy as np
import pickle
import os
import base64
from io import BytesIO
from PIL import Image

ENCODINGS_DIR = os.path.join(os.path.dirname(__file__), 'encodings')


def _decode_base64_image(base64_string):
    """Convert a base64 data URL (from webcam capture) into a numpy image array."""
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    img_bytes = base64.b64decode(base64_string)
    img = Image.open(BytesIO(img_bytes)).convert('RGB')
    return np.array(img)


def get_face_encoding(base64_image):
    """Extract a single face encoding from a base64 image. Returns None if no face found."""
    image = _decode_base64_image(base64_image)
    face_locations = face_recognition.face_locations(image)

    if len(face_locations) == 0:
        return None, 'No face detected in the image'
    if len(face_locations) > 1:
        return None, 'Multiple faces detected — please ensure only one person is in frame'

    encodings = face_recognition.face_encodings(image, face_locations)
    return encodings[0], None


def save_encoding(student_id, encoding):
    """Persist a student's face encoding to disk as a pickle file."""
    os.makedirs(ENCODINGS_DIR, exist_ok=True)
    file_path = os.path.join(ENCODINGS_DIR, f'{student_id}.pkl')
    with open(file_path, 'wb') as f:
        pickle.dump(encoding, f)


def load_encoding(student_id):
    """Load a previously saved encoding. Returns None if not found."""
    file_path = os.path.join(ENCODINGS_DIR, f'{student_id}.pkl')
    if not os.path.exists(file_path):
        return None
    with open(file_path, 'rb') as f:
        return pickle.load(f)


def verify_face(student_id, base64_image, tolerance=0.5):
    """Compare a live capture against the stored encoding for this student."""
    stored_encoding = load_encoding(student_id)
    if stored_encoding is None:
        return False, 'No enrolled face found for this student', None

    live_encoding, err = get_face_encoding(base64_image)
    if err:
        return False, err, None

    distance = face_recognition.face_distance([stored_encoding], live_encoding)[0]
    match = distance <= tolerance

    return match, None, float(distance)