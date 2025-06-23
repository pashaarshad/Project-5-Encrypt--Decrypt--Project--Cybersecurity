import numpy as np
import cv2
import string
import os
from matplotlib import pyplot as plt
from io import BytesIO
from PIL import Image

d = {chr(i): i for i in range(255)}
c = {i: chr(i) for i in range(255)}

PREFIX = "STEGO:"

def _embed_bits(x_enc, bits):
    n = m = z = 0
    for bit in bits:
        org_val = x_enc[n, m, z]
        x_enc[n, m, z] = (org_val & 0b11111110) | bit
        z = (z + 1) % 3
        if z == 0:
            m = m + 1
            if m == x_enc.shape[1]:
                m = 0
                n = n + 1
    return n, m, z

def _extract_bits(x_enc, num_bits):
    n = m = z = 0
    bits = []
    for _ in range(num_bits):
        bit = x_enc[n, m, z] & 1
        bits.append(bit)
        z = (z + 1) % 3
        if z == 0:
            m = m + 1
            if m == x_enc.shape[1]:
                m = 0
                n = n + 1
    return bits, n, m, z

def encrypt_image(image_bytes, text, key):
    # Read image from bytes
    image_array = np.frombuffer(image_bytes, np.uint8)
    x = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    x_enc = x.copy()
    # Add prefix to message
    text = PREFIX + text
    l = len(text)
    # Store message length as 4 bytes (32 bits) at the start
    length_bytes = l.to_bytes(4, 'big')
    length_bits = [(b >> (7 - i)) & 1 for b in length_bytes for i in range(8)]
    n, m, z = _embed_bits(x_enc, length_bits)
    # Now embed the message
    kl = 0
    for i in range(l):
        char_val = d[text[i]] ^ d[key[kl]]
        char_bits = [(char_val >> (7 - bit_pos)) & 1 for bit_pos in range(8)]
        for bit in char_bits:
            org_val = x_enc[n, m, z]
            x_enc[n, m, z] = (org_val & 0b11111110) | bit
            z = (z + 1) % 3
            if z == 0:
                m = m + 1
                if m == x_enc.shape[1]:
                    m = 0
                    n = n + 1
        kl = (kl + 1) % len(key)
    # Encode to PNG in memory
    _, buffer = cv2.imencode('.png', x_enc)
    return buffer.tobytes()

def decrypt_image(image_bytes, key, _=None):
    image_array = np.frombuffer(image_bytes, np.uint8)
    x_enc = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    # First extract the message length (32 bits)
    length_bits, n, m, z = _extract_bits(x_enc, 32)
    length = 0
    for bit in length_bits:
        length = (length << 1) | bit
    l = length
    de = ""
    kl = 0
    for i in range(l):
        val = 0
        for bit_pos in range(8):
            bit = x_enc[n, m, z] & 1
            val = (val << 1) | bit
            z = (z + 1) % 3
            if z == 0:
                m = m + 1
                if m == x_enc.shape[1]:
                    m = 0
                    n = n + 1
        orig_char = c[val ^ d[key[kl]]]
        de += orig_char
        kl = (kl + 1) % len(key)
    # Check for prefix
    if de.startswith(PREFIX):
        return de[len(PREFIX):]
    else:
        return None
