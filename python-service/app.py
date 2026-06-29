from flask import Flask, request, jsonify
from flask_cors import CORS
from face_utils import get_face_encoding, save_encoding, verify_face
import os

app = Flask(__name__)
CORS(app)


@app.route('/health')
def health():
    return jsonify({"status": "ok"})


@app.route('/enroll', methods=['POST'])
def enroll():
    """
    Body: { "studentId": "...", "image": "data:image/jpeg;base64,..." }
    Extracts a face encoding from the image and saves it for this student.
    """
    data = request.get_json()
    student_id = data.get('studentId')
    image = data.get('image')

    if not student_id or not image:
        return jsonify({"error": "studentId and image are required"}), 400

    encoding, err = get_face_encoding(image)
    if err:
        return jsonify({"error": err}), 400

    save_encoding(student_id, encoding)
    return jsonify({"message": "Face enrolled successfully"}), 201


@app.route('/verify', methods=['POST'])
def verify():
    """
    Body: { "studentId": "...", "image": "data:image/jpeg;base64,..." }
    Compares the live image against the stored encoding for this student.
    """
    data = request.get_json()
    student_id = data.get('studentId')
    image = data.get('image')

    if not student_id or not image:
        return jsonify({"error": "studentId and image are required"}), 400

    match, err, distance = verify_face(student_id, image)
    if err:
        return jsonify({"error": err}), 400

    return jsonify({"match": match, "distance": distance}), 200

if __name__ == "__main__":
    app.run(port=5001, debug=True)