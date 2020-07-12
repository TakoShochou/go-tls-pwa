console.log('service-worker')

self.addEventListener('install', event => {
    console.log('install')
    event.waitUntil(
        caches.open('demo-cache')
            .then(cache => cache.addAll([
                'index.html',
                'index.css',
                'main.js',
            ]))
    )
})

self.addEventListener('fetch', event => {
    return fetch(url)
        .then(res => {
            if (!res.ok) {
                throw Errorr(res.statusText)
            }
            return caches.open('demo-cache')
                .then(cache => {
                    cache.put(url, res.clone())
                    return res
                })
        })
        .catch(e => {
            console.log('request failed', e)
        })
})