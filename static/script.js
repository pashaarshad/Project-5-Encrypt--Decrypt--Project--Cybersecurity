// Encrypt Panel
const encryptForm = document.getElementById('encrypt-form');
const encryptStatus = document.getElementById('encrypt-status');
const encryptBtn = document.getElementById('encrypt-btn');
const coverInput = document.getElementById('cover-image');
const coverPreview = document.getElementById('cover-preview');

encryptForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    encryptStatus.textContent = '';
    encryptStatus.classList.remove('visible');
    encryptBtn.disabled = true;
    encryptBtn.textContent = 'Encrypting...';

    const imageFile = coverInput.files[0];
    const secretMessage = document.getElementById('secret-message').value;
    const secretKey = document.getElementById('secret-key').value;

    if (!imageFile || !secretMessage || !secretKey) {
        encryptStatus.textContent = 'All fields are required.';
        encryptStatus.classList.add('visible');
        encryptBtn.disabled = false;
        encryptBtn.textContent = 'Encrypt & Download';
        return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('message', secretMessage);
    formData.append('key', secretKey);

    try {
        const response = await fetch('/encrypt', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error('Encryption failed.');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stegno_object.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        encryptStatus.textContent = 'Encryption successful! Image downloaded.';
        encryptStatus.classList.add('visible');
    } catch (err) {
        encryptStatus.textContent = 'Encryption failed.';
        encryptStatus.classList.add('visible');
    }
    encryptBtn.disabled = false;
    encryptBtn.textContent = 'Encrypt & Download';
});

coverInput.addEventListener('change', function() {
    if (coverInput.files && coverInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            coverPreview.src = e.target.result;
            coverPreview.style.display = 'block';
        };
        reader.readAsDataURL(coverInput.files[0]);
    } else {
        coverPreview.src = '';
        coverPreview.style.display = 'none';
    }
});

// Decrypt Panel
const decryptForm = document.getElementById('decrypt-form');
const decryptStatus = document.getElementById('decrypt-status');
const decryptBtn = document.getElementById('decrypt-btn');
const decryptedMessage = document.getElementById('decrypted-message');
const stegnoInput = document.getElementById('stegno-image');
const stegnoPreview = document.getElementById('stegno-preview');

decryptForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    decryptStatus.textContent = '';
    decryptStatus.classList.remove('visible');
    decryptedMessage.textContent = '';
    decryptedMessage.classList.remove('visible');
    decryptBtn.disabled = true;
    decryptBtn.textContent = 'Decrypting...';

    const stegnoFile = stegnoInput.files[0];
    const decryptKey = document.getElementById('decrypt-key').value;

    if (!stegnoFile || !decryptKey) {
        decryptStatus.textContent = 'All fields are required.';
        decryptStatus.classList.add('visible');
        decryptBtn.disabled = false;
        decryptBtn.textContent = 'Decrypt';
        return;
    }

    const formData = new FormData();
    formData.append('image', stegnoFile);
    formData.append('key', decryptKey);

    try {
        const response = await fetch('/decrypt', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.status === 'granted') {
            decryptStatus.textContent = 'Access Granted';
            decryptStatus.style.color = '#2ecc40';
            decryptedMessage.textContent = result.message;
            decryptedMessage.classList.add('visible');
        } else {
            decryptStatus.textContent = 'Access Denied';
            decryptStatus.style.color = '#e74c3c';
            decryptedMessage.textContent = '';
            decryptedMessage.classList.remove('visible');
        }
        decryptStatus.classList.add('visible');
    } catch (err) {
        decryptStatus.textContent = 'Decryption failed.';
        decryptStatus.style.color = '#e74c3c';
        decryptStatus.classList.add('visible');
    }
    decryptBtn.disabled = false;
    decryptBtn.textContent = 'Decrypt';
});

stegnoInput.addEventListener('change', function() {
    if (stegnoInput.files && stegnoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            stegnoPreview.src = e.target.result;
            stegnoPreview.style.display = 'block';
        };
        reader.readAsDataURL(stegnoInput.files[0]);
    } else {
        stegnoPreview.src = '';
        stegnoPreview.style.display = 'none';
    }
});
