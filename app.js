const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
const bookingController = require('./controllers/bookingController');

const app = express();

// setup pug, our template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());

// 'options' is just another type of request such as get, post, put, delete etc
// So here is like calling app.get() or app.post() but with the options type of request
// An option request is sent by the browser when there is a preflight phase
app.options('*', cors());
// Another example if we wanted to implemented it for a specific route would be:
// app.options('/api/v1/tours/:id', cors());

// Set security HTTP headers
// Further HELMET configuration for Security Policy (CSP)
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://*.leaflet.com/',
  'https://*.cloudflare.com',
  'https://js.stripe.com/v3/',
  'https://checkout.stripe.com',
];
const styleSrcUrls = [
  'https://*.leafet.com/',
  'https://api.tiles.leaflet.com/',
  'https://*.cloudflare.com',
  'https://fonts.googleapis.com/',
  'https://www.myfonts.com/fonts/radomir-tinkov/gilroy/*',
  ' checkout.stripe.com',
];
const connectSrcUrls = [
  'https://*.leaflet.com/',
  'https://*.cloudflare.com',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:52191',
  'ws://127.0.0.1:1234',
  '*.stripe.com',
  'wss://nasty-tours.onrender.com:1234/',
];

const imgSrcUrls = ['https://*.tile.openstreetmap.org'];

const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ['*.stripe.com', '*.stripe.network'],
    },
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Run the logger package only if we are in development environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Add this limiter middleware to mitigate DDOS and Brute Force attacks
// Limits requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour.',
});

app.use('/api', limiter);

// Stripe checkout webhook
//  NOTE we need the response in raw format and not json. This is why we put this router here,
// above the json middleware below
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// Body parser. Reads data from body into req.body
app.use(express.json({ limit: '10kb' }));
// Cookie parser. Reads cookies from requests
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  // console.log(req.cookies); // from cookie-parser package
  next();
});

// Middleware to greatly compress text responses from our server
app.use(compression());

// 3) ROUTES (MOUNTING ROUTES)
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorController);

module.exports = app;
