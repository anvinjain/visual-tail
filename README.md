# Visual Tail

Framework to connect datasources (ideally streaming ones), transform extracted data entries and feed them to visualizations which accept data events.

> Code adapted from [Bogey](http://bogey.cognizo.com)

---

### Included datasources

#### Http Streaming Json
Works on json objects sent over http stream (contiguous, not separated by any character)
Supports running `fetch` in a continuous loop and handles streams on every chunk basis.

---

### Included visualizations

#### Pong visualization
Pong visualization adapted from [Bogey Pong](https://github.com/cognizo/bogey-pong) which in turn is heavily inspired by [Logstalgia](https://code.google.com/p/logstalgia/).

Pong represents web server traffic as a giant pong game. Every request is a ball. Successful requests (200 status codes) are returned by the paddle, 400 status codes are misses and 500s are screen-shaking explosions. Requests are grouped together by IP address and floods of requests from the same client are represented as long streams of balls. This makes it really easy to pick out strange or suspicious traffic patterns.

Pong uses the [Phaser](http://phaser.io/) game engine. It also comes with a bunch of themes based on popular coding color schemes.
