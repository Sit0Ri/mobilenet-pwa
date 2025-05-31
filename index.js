// index.js

const imgElement = document.getElementById('img');
const fileInput = document.getElementById('file-input');
const camBtn = document.getElementById('cam-btn');
const resultsDiv = document.getElementById('results');
let model = null;

// 1) Проверим, что tf и mobilenet вообще загрузились и версии читаются
console.log('tf exists?', typeof tf !== 'undefined');
console.log('tf.versions:', tf.versions);
console.log('mobilenet.version:', mobilenet.version);

// 2) Загрузка модели
async function loadModel() {
  try {
    model = await mobilenet.load({
      version: 1,
      alpha: 1,
      modelUrl: './models/model.json'
    });
    console.log('[Index.js] Модель загружена локально:', model);
  } catch (e) {
    console.error('[Index.js] Ошибка при загрузке модели:', e);
  }
}

// 3) Классификация
async function classifyImage() {
  if (!model) {
    console.warn('[Index.js] Модель ещё не загружена!');
    return;
  }
  try {
    const predictions = await model.classify(imgElement);
    console.log('[Index.js] predictions:', predictions);
    drawTable(predictions);
  } catch (e) {
    console.error('[Index.js] Ошибка при классификации:', e);
  }
}

// 4) Отрисовка таблицы
function drawTable(predictions) {
  let html = '<table border="1" cellpadding="4"><tr><th>Класс</th><th>Вероятность</th></tr>';
  predictions.forEach(p => {
    html += `<tr><td>${p.className}</td><td>${(p.probability * 100).toFixed(1)} %</td></tr>`;
  });
  html += '</table>';
  resultsDiv.innerHTML = html;
}

// 5) Загрузка файла с диска
fileInput.addEventListener('change', (evt) => {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    imgElement.src = e.target.result;
    imgElement.onload = () => classifyImage();
  };
  reader.readAsDataURL(file);
});

// 6) Съёмка с камеры
camBtn.addEventListener('click', async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const video = document.createElement('video');
  video.autoplay = true;
  video.srcObject = stream;
  document.body.appendChild(video);

  await new Promise(r => {
    video.onloadedmetadata = () => {
      video.play();
      r();
    };
  });

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  stream.getTracks().forEach(t => t.stop());
  video.remove();

  imgElement.src = canvas.toDataURL('image/jpeg');
  imgElement.onload = () => classifyImage();
});

// 7) При старте загружаем модель
window.addEventListener('load', () => {
  loadModel();
});
