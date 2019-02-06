# Battlefy Technical Exercise
React frontend (using create-react-app, no service worker) with a Node.js backend running Express. [Live site](https://ronva-battlefy.herokuapp.com/).

**"if this was a production application, how would you handle the situation where your application goes over the rate limiting threshold on Riot Games' API?"**

The obvious first step is making sure that the application is using the a production Riot Games API key. Assuming that is already the case, if the application reaches the rate limit the most important thing to do is to cache as much data as possible. Only when a user searches for a summoner for the very first time or requests new data from the API should any Riot Games endpoints be called. In all other cases it is better to load cached information and notify the user if it might be stale. If calling the endpoint is crucial it is possible to retry the call during the next rate limit window.

**"if you could architect a solution that would work on production at scale, how would you design that system?"**

To make sure that the application scales in production I would look into either manually setting up server scaling and load balancing using a service like AWS or go with a serverless solution that takes care of it automatically like Netlify Functions. I would not only rely on server cache to serve data that does not need to be refreshed but also look into making the app store any static resources on the client (with a service worker, for example). I would also add pagination to match results for faster load times and prefetching capabilities.
