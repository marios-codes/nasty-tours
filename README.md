# Nasty Tours

NOTE: Please add your  ```config.env``` in the main directory using your own respective services' keys and configurations.

This is a backend app with a custom RESTful API that serves requests regarding a tour booking agency. Using the Postman collection you can interact with the various endpoints, which in their turn communicate with the database.
There's also a frontend access to the API, which is more like a Proof of Concept for the backend, and does some basic requests using the UI. 
You can find it [On Render](https://nasty-tours.onrender.com/). As it is hosted in a free tier give it some time to load ;). I built it to put in action all the best practices I learned for NodeJS, ExpressJS, MongoDB, Mongoose and other fundamental concepts.

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/5804432-2283e0df-2cf0-4c44-853b-9828977ba1c1?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D5804432-2283e0df-2cf0-4c44-853b-9828977ba1c1%26entityType%3Dcollection%26workspaceId%3D733431bf-8fc5-4ea1-bca7-b52186f5ca46)


## Used Frameworks/ Libraries
* [NodeJS](https://nodejs.org/)
* [ExpressJS](https://expressjs.com/)
* [MongoDB](https://www.mongodb.com/)
* [Mongoose](https://mongoosejs.com/)
* [Pug](https://github.com/pugjs/pug)
* [Stripe](https://stripe.com/)
* [Parcel](https://parceljs.org/)
* [DotEnv](https://github.com/motdotla/dotenv)
* [JsonWebToken](https://github.com/auth0/node-jsonwebtoken)
* [Morgan](https://github.com/expressjs/morgan)
* [slugify](https://github.com/simov/slugify)
* [multer](https://github.com/expressjs/multer)
* [cookie-parser](https://github.com/expressjs/cookie-parser)
* [validator](https://github.com/validatorjs/validator.js)
* [nodemailer](https://nodemailer.com/about/)
* [express-rate-limit](https://github.com/nfriedly/express-rate-limit)
* [helmet](https://github.com/helmetjs/helmet)
* [express-mongo-sanitize](https://github.com/fiznool/express-mongo-sanitize#readme)
* [xss-clean](https://github.com/jsonmaur/xss-clean)
* [hpp](https://github.com/analog-nico/hpp)
* [cors](https://github.com/expressjs/cookie-parser)

## What Does This Project Contain?
* Node.js Architecture: Dived into the internals of Node.js, exploring the event loop, thread pool, and how asynchronous operations are handled.
* Asynchronous JavaScript: Implemented the fundamentals of promises and modern async/await syntax for handling asynchronous code.
* Express Framework: Built robust API routes with Express, handling HTTP verbs, parsing URL parameters, created custom middleware, and more.
* MongoDB: Get hands-on with MongoDB. Create databases and collections, perform CRUD operations, and connect to MongoDB Atlas for cloud-hosted databases.
* Mongoose: Implemented Mongoose's schema-driven data modeling, CRUD operations, nested routes, geospatial queries, advanced query filtering, query middleware (e.g.filtering, sorting, pagination, aliasing), aggregation pipeline, virtual properties etc.
* Express Error Handling: Implemented error handling strategies including handling undefined routes, creating global error middleware, catching errors in async functions, and managing uncaught exceptions.
* Authorization and Authentication with JWT and user roles
* Send email upon registation for verification and authorization
* Payments through Stripe
* Server Side Rendering with Pug
* File uploads
* Map rendering and interaction by Leaflet
* Security best practices

### Screenshots
<img width="1611" alt="Tours Overview" src="https://github.com/user-attachments/assets/4f377351-9748-4b7b-9d10-8097d88b1454">
<img width="1609" alt="Tour's details" src="https://github.com/user-attachments/assets/4b99f35b-bb73-401b-ad6a-2c9c9a9d0ae2">
<img width="1668" alt="Stripe checkout" src="https://github.com/user-attachments/assets/dbd31bf3-5b48-40db-a4d9-752a33595df2">
<img width="1606" alt="User Profile" src="https://github.com/user-attachments/assets/01b26792-85ae-405c-9011-323259fb4dca">
