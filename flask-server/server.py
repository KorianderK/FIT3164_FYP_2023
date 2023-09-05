from flask import Flask, request, jsonify
import cv2
import numpy as np
from flask_cors import CORS 

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/process-image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify(message='No file part'), 400

    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify(message='No selected file'), 400

    try:
        image_np = np.fromfile(image_file, np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        _, encoded_image = cv2.imencode('.jpg', gray_image)
        response = encoded_image.tobytes()

        return response, 200
    except Exception as e:
        return jsonify(message='Error processing the image'), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
