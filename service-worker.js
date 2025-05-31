const CACHE_NAME = 'mobilenet-v3';

// Все файлы, включая model.json и .bin-файлы
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/libs/tf.min.js',
  '/libs/mobilenet.min.js',
  '/index.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/models/model.json',
  '/models/group1-shard1of5.bin',
  '/models/group1-shard2of5.bin',
  '/models/group1-shard3of5.bin',
  '/models/group1-shard4of5.bin',
  '/models/group1-shard5of5.bin'
];

// Установка: всё кэшируем
self.addEventListener('install', (event) => {
  self.skipWaiting(); // сразу активируем
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Активация: контролируем страницы
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Запросы: сначала ищем в кэше, потом из сети
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});