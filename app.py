from flask import Flask, render_template, request, send_file, jsonify
from stegano_code import encrypt_image, decrypt_image
import io
import numpy as np
import cv2
from PIL import Image

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/encrypt', methods=['POST'])
def encrypt():
    image = request.files['image']
    message = request.form['message']
    key = request.form['key']
    image_bytes = image.read()
    result_bytes = encrypt_image(image_bytes, message, key)
    return send_file(
        io.BytesIO(result_bytes),
        mimetype='image/png',
        as_attachment=True,
        download_name='stegno_object.png'
    )

@app.route('/decrypt', methods=['POST'])
def decrypt():
    image = request.files['image']
    key = request.form['key']
    image_bytes = image.read()
    try:
        message = decrypt_image(image_bytes, key)
        if message is not None and message.strip():
            return jsonify({'status': 'granted', 'message': message})
        else:
            return jsonify({'status': 'denied'})
    except Exception:
        return jsonify({'status': 'denied'})

if __name__ == '__main__':
    app.run(debug=True)
