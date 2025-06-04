import 'dotenv/config'; // Load environment variables from a .env file
import { App } from '@tinyhttp/app'; // Tinyhttp app framework
import bodyParser from 'body-parser'; // Middleware for parsing request bodies
import { logger } from '@tinyhttp/logger'; // Middleware for logging HTTP requests
import { Liquid } from 'liquidjs'; // Template engine for rendering views
import sirv from 'sirv'; // Static file server middleware

// API endpoints for fetching data
const wordPressAPI = `https://framerframed.nl/en/wp-json/wp/v2/pages`;
const eventsAPI = `https://archive.framerframed.nl/api/ff/events`;
const personAPI = `https://archive.framerframed.nl/api/ff/persons`;
const eventTypesAPI = `https://archive.framerframed.nl/api/ff/eventtypes`;

// Initialize the Liquid template engine with .liquid file extension
const engine = new Liquid({
  extname: '.liquid',
});

// Create a new Tinyhttp app instance
const app = new App();

// Utility function to add image URLs to events
function eventImageUrls(events) {
  return events.map(event => {
    const assetRel = event.relationships?.find(rel => rel.node === 'Asset');
    const imageUrl = assetRel 
      ? `https://archive.framerframed.nl/assets/${assetRel.uuid}/hd.webp`
      : '/images/placeholder.webp'; // fallback image in public/images
    return {
      ...event,
      imageUrl
    };
  });
}


// Utility function to add image URLs to people
function personImageUrls(people) {
  return people.map(person => {
    const assetRel = person.relationships?.find(rel => rel.node === 'Asset');
    const imageUrl = assetRel 
      ? `https://archive.framerframed.nl/assets/${assetRel.uuid}/hd.webp`
      : '/images/placeholder.webp'; // fallback image in public/images
    return {
      ...person,
      imageUrl
    };
  });
}



// Middleware setup
app
  .use(logger()) // Log HTTP requests
  .use(bodyParser.urlencoded({ extended: true })) // Parse URL-encoded request bodies
  .use('/', sirv('dist')) // Serve static files from the 'dist' directory
  .listen(3000, () => console.log('Server available on http://localhost:3000')); // Start the server on port 3000

// Route: Home page
app.get('/', async (req, res) => {
  // Fetch events data
  const dataEvents = await fetch(eventsAPI);
  const allEvents = await dataEvents.json();

  // Fetch event types data
  const dataEventTypes = await fetch(eventTypesAPI);
  const allEventTypes = await dataEventTypes.json();

  // Filter events with valid titles
  const filteredEvents = allEvents.filter(
    (e) => e.event && e.event.title_nl && e.event.title_nl.trim() !== ''
  );

  // Add image URLs to events
  const eventsWithImages = eventImageUrls(filteredEvents);

  // Fetch people data
  const dataPeople = await fetch(personAPI);
  const allArtists = await dataPeople.json();

  // Render the home page template with data
  return res.send(renderTemplate('server/views/index.liquid', { 
    title: 'Home', 
    allEvents: eventsWithImages, 
    allArtists, 
    allEventTypes 
  }));
});


// Route: Search functionality
app.post('/search', async (req, res) => {
  const searchQuery = req.body.search; // Get the search query from the request body
  console.log(searchQuery);

  // Redirect to the home page with the search query as a query parameter
  return res.redirect(`/?search=${searchQuery}`);
});



// Route: Archive page
app.get('/archive/type/:eventType', async (req, res) => {
  const selectedEvent = req.query.eventType || req.params.eventType || 'all';

  console.log(selectedEvent)

  // Fetch events data
  const dataEvents = await fetch(eventsAPI);
  const allEvents = await dataEvents.json();

  // Fetch event types data
  const dataEventTypes = await fetch(eventTypesAPI);
  const allEventTypes = await dataEventTypes.json();

  // Filter events with valid titles
  let filteredEvents = allEvents.filter(
    (e) => e.event && e.event.title_nl && e.event.title_nl.trim() !== ''
  );

  // Filter events by selected type if provided
  if (selectedEvent && selectedEvent !== 'all') {
    filteredEvents = filteredEvents.filter(
      (e) => e.event.type_nl === selectedEvent
    );
  }

  // Add image URLs to events
  const eventsWithImages = eventImageUrls(filteredEvents);

  // Fetch people data
  const dataPeople = await fetch(personAPI);
  const allArtists = await dataPeople.json();

  // Render the archive page template with data
  return res.send(renderTemplate('server/views/archive.liquid', { 
    title: 'Archive', 
    allEvents: eventsWithImages, 
    allArtists, 
    allEventTypes, 
    selectedEvent 
  }));
});



app.get('/archive/:uuid', async (req, res) => {
  const uuid = req.params.uuid;

  // Fetch all events
  const eventsResponse = await fetch(eventsAPI);
  const allProjects = await eventsResponse.json();

  // Fetch all people
  const peopleResponse = await fetch(personAPI);
  const allPeople = await peopleResponse.json();

  // Add image URLs to people and events
  const allArtists = personImageUrls(allPeople);
  const allEvents = eventImageUrls(allProjects);

  // Try to find a matching event
  const event = allEvents.find(e => e.event.uuid === uuid);

  // Try to find a matching person
  const person = allPeople.find(p => p.person.uuid === uuid);

  // If neither is found, return 404
  if (!event && !person) {
    return res.status(404).send('Not found');
  }

  if (event) {
    console.log(event)
  } else {
    console.log(person)
  }

  // Render template with both possibilities; the Liquid logic handles the rest
  return res.send(
    renderTemplate('server/views/details.liquid', {
      title: event?.event?.title_nl || person?.person?.name || 'Detail',
      event,
      person,
      allArtists,
      allEvents // Needed to resolve relationships for people
    })
  );
});




// Utility function to render templates with data
const renderTemplate = (template, data) => {
  const templateData = {
    NODE_ENV: process.env.NODE_ENV || 'production', // Add environment variable to template data
    ...data, // Merge additional data
  };

  return engine.renderFileSync(template, templateData); // Render the template synchronously
};
