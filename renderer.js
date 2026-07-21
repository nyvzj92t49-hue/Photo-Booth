const video = document.querySelector('#video');
const canvas = document.querySelector('#canvas');
const cameraSelect = document.querySelector('#cameraSelect');
const cameraMessage = document.querySelector('#cameraMessage');
const captureButton = document.querySelector('#captureButton');
const countdown = document.querySelector('#countdown');
const flash = document.querySelector('#flash');
const statusDot = document.querySelector('#statusDot');
const statusTitle = document.querySelector('#statusTitle');
const statusText = document.querySelector('#statusText');
const directoryPath = document.querySelector('#directoryPath');
const lastPhotoCard = document.querySelector('#lastPhotoCard');
const lastPhoto = document.querySelector('#lastPhoto');
const lastPhotoName = document.querySelector('#lastPhotoName');

let activeStream;
let isCapturing = false;
const isDesktopApp = Boolean(window.photobooth);
const appBridge = window.photobooth || {
  getDirectory: async () => 'Dossier Téléchargements de Windows',
  chooseDirectory: async () => 'Dossier Téléchargements de Windows',
  openDirectory: async () => alert('Cliquez sur l’icône des téléchargements du navigateur pour retrouver les photos.'),
  savePhoto: async (dataUrl) => {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `photobooth-${stamp}.jpg`;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    return { filename, fullPath: filename };
  },
  toggleFullscreen: async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return false;
    }
    await document.documentElement.requestFullscreen();
    return true;
  }
};

function setStatus(ready, title, text) {
  statusDot.classList.toggle('ready', ready);
  statusTitle.textContent = title;
  statusText.textContent = text;
}

async function listCameras(selectedId) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter((device) => device.kind === 'videoinput');
  cameraSelect.replaceChildren();
  cameras.forEach((camera, index) => {
    const option = document.createElement('option');
    option.value = camera.deviceId;
    option.textContent = camera.label || `Caméra ${index + 1}`;
    option.selected = camera.deviceId === selectedId;
    cameraSelect.append(option);
  });
  return cameras;
}

async function startCamera(deviceId) {
  if (activeStream) activeStream.getTracks().forEach((track) => track.stop());
  cameraMessage.hidden = false;
  captureButton.disabled = true;
  setStatus(false, 'Connexion…', 'Ouverture de la caméra');

  try {
    const constraints = {
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        : { width: { ideal: 1920 }, height: { ideal: 1080 } }
    };
    activeStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = activeStream;
    await video.play();
    const cameras = await listCameras(activeStream.getVideoTracks()[0].getSettings().deviceId);
    const trackLabel = activeStream.getVideoTracks()[0].label || 'Caméra active';
    cameraMessage.hidden = true;
    captureButton.disabled = false;
    setStatus(true, 'Caméra prête', trackLabel);

    if (!deviceId) {
      const camo = cameras.find((camera) => camera.label.toLowerCase().includes('camo'));
      if (camo && camo.deviceId !== cameraSelect.value) await startCamera(camo.deviceId);
    }
  } catch (error) {
    cameraMessage.innerHTML = '<strong>Caméra inaccessible</strong><span>Vérifiez Camo Studio et les autorisations caméra de Windows.</span>';
    setStatus(false, 'Caméra indisponible', error.name === 'NotAllowedError' ? 'Autorisation refusée' : 'Vérifiez Camo Studio');
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function takePhoto() {
  if (isCapturing || !activeStream) return;
  isCapturing = true;
  captureButton.disabled = true;
  try {
    for (const value of ['3', '2', '1']) {
      countdown.textContent = value;
      await delay(900);
    }
    countdown.textContent = '';
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
    flash.classList.remove('active');
    void flash.offsetWidth;
    flash.classList.add('active');
    const result = await appBridge.savePhoto(dataUrl);
    lastPhoto.src = dataUrl;
    lastPhotoName.textContent = result.filename;
    lastPhotoCard.hidden = false;
    setStatus(true, 'Photo enregistrée !', result.filename);
  } catch (error) {
    setStatus(false, 'Erreur d’enregistrement', error.message);
  } finally {
    isCapturing = false;
    captureButton.disabled = false;
  }
}

cameraSelect.addEventListener('change', () => startCamera(cameraSelect.value));
captureButton.addEventListener('click', takePhoto);
document.querySelector('#openFolderButton').addEventListener('click', () => appBridge.openDirectory());
document.querySelector('#chooseFolderButton').addEventListener('click', async () => {
  directoryPath.textContent = await appBridge.chooseDirectory();
});
document.querySelector('#fullscreenButton').addEventListener('click', () => appBridge.toggleFullscreen());
document.addEventListener('keydown', (event) => {
  const shutterKeys = new Set([
    'Space',
    'Enter',
    'NumpadEnter',
    'ArrowUp',
    'ArrowDown',
    'AudioVolumeUp',
    'AudioVolumeDown',
    'VolumeUp',
    'VolumeDown',
    'MediaPlayPause',
    'F8'
  ]);
  if (shutterKeys.has(event.code) && event.target.tagName !== 'SELECT') {
    event.preventDefault();
    takePhoto();
  }
  if (event.code === 'F11') appBridge.toggleFullscreen();
});
navigator.mediaDevices.addEventListener('devicechange', () => listCameras(cameraSelect.value));
if (isDesktopApp) window.photobooth.onRemoteShutter(takePhoto);

(async () => {
  directoryPath.textContent = await appBridge.getDirectory();
  if (!isDesktopApp) {
    document.querySelector('#chooseFolderButton').hidden = true;
    document.querySelector('#openFolderButton').textContent = 'Retrouver les photos';
  }
  await startCamera();
})();
