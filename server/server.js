import 'dotenv/config'; // Load environment variables from a .env file
import { App } from '@tinyhttp/app'; // Tinyhttp app framework
import bodyParser from 'body-parser'; // Middleware for parsing request bodies
import { logger } from '@tinyhttp/logger'; // Middleware for logging HTTP requests
import { Liquid } from 'liquidjs'; // Template engine for rendering views
import sirv from 'sirv'; // Static file server middleware
import { eventImageUrls, personImageUrls, filterEventsByLang, filterPersonsByLang, getEventTypeName } from './utils.js';

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

// Middleware setup
app
  .use(logger()) // Log HTTP requests
  .use(bodyParser.urlencoded({ extended: true })) // Parse URL-encoded request bodies
  .use('/', sirv('dist')) // Serve static files from the 'dist' directory
  .listen(3000, () => console.log('Server available on http://localhost:3000')); // Start the server on port 3000


// Redirect to default lang if missing
app.use((req, res, next) => {
  if (!/^\/(EN|NL)(\/|$)/i.test(req.path)) {
    return res.redirect(`/EN${req.path}`);
  }
  next();
});

// Validate lang param if present
app.use((req, res, next) => {
  const lang = req.params.lang?.toUpperCase();
  if (lang && !['EN', 'NL'].includes(lang)) {
    return res.redirect('/EN');
  }
  next();
});

// Route: Home page - all data
app.get('/:lang', async (req, res) => {
  const lang = req.params.lang.toUpperCase();

  const [dataEvents, dataEventTypes, dataPeople] = await Promise.all([
    fetch(eventsAPI),
    fetch(eventTypesAPI),
    fetch(personAPI)
  ]);
  const [allEventsRaw, allEventTypes, allPeople] = await Promise.all([
    dataEvents.json(),
    dataEventTypes.json(),
    dataPeople.json()
  ]);

  const allEvents = eventImageUrls(allEventsRaw);
  const filteredEvents = filterEventsByLang(allEvents, lang);
  const filteredArtists = personImageUrls(filterPersonsByLang(allPeople, lang));


  return res.send(renderTemplate('server/views/index.liquid', { 
    title: 'Home', 
    allEvents: filteredEvents, 
    allArtists: filteredArtists, 
    allEventTypes,
    lang,
    currentPath: req.path,
  }));
});

// Route: Home page - category data
app.get('/:lang/category', async (req, res) => {
  const lang = req.params.lang.toUpperCase();

  const [dataEvents, dataEventTypes, dataPeople] = await Promise.all([
    fetch(eventsAPI),
    fetch(eventTypesAPI),
    fetch(personAPI)
  ]);
  const [allEventsRaw, allEventTypes, allPeople] = await Promise.all([
    dataEvents.json(),
    dataEventTypes.json(),
    dataPeople.json()
  ]);

  const allEvents = eventImageUrls(allEventsRaw);
  const filteredEvents = filterEventsByLang(allEvents, lang);
  const filteredArtists = personImageUrls(filterPersonsByLang(allPeople, lang));


  return res.send(renderTemplate('server/views/category.liquid', { 
    title: 'home/category', 
    allEvents: filteredEvents, 
    allArtists: filteredArtists, 
    allEventTypes,
    lang,
    currentPath: req.path,
  }));
});


// Route: Search functionality
app.post('/:lang/search', async (req, res) => {
  const searchQuery = req.body.search; // Get the search query from the request body
  console.log(searchQuery);

  // Redirect to the home page with the search query as a query parameter
  return res.redirect(`/?search=${searchQuery}`);
});



// Route: Archive page
app.get('/:lang/archive/type/:eventType', async (req, res) => {
  const { lang, eventType } = req.params;
  const queryEventType = req.query.eventType;

  // Kies eventType uit query of params, query gaat voor
  const selectedEventRaw = queryEventType || eventType || 'all';
  const selectedEvent = selectedEventRaw.toLowerCase() === 'all' ? 'all' : selectedEventRaw;
  const upperLang = lang.toUpperCase();

  // Fetch data
  const [dataEvents, dataEventTypes, dataPeople] = await Promise.all([
    fetch(eventsAPI),
    fetch(eventTypesAPI),
    fetch(personAPI)
  ]);
  const [allEventsRaw, allEventTypes, allPeople] = await Promise.all([
    dataEvents.json(),
    dataEventTypes.json(),
    dataPeople.json()
  ]);

  const allEvents = eventImageUrls(allEventsRaw);
  const filteredEvents = filterEventsByLang(allEvents, upperLang)
    .filter(e => {
      const type = upperLang === 'EN' ? e.event.type_en : e.event.type_nl;
      return selectedEvent === 'all' || type === selectedEvent;
    });

  const filteredArtists = personImageUrls(filterPersonsByLang(allPeople, upperLang));

  console.log('Selected Event:', selectedEvent);

  return res.send(renderTemplate('server/views/archive.liquid', { 
    title: 'Archive', 
    allEvents: filteredEvents, 
    allArtists: filteredArtists, 
    allEventTypes, 
    selectedEvent,
    lang: upperLang,
    currentPath: req.path,
  }));
});



app.get('/:lang/archive/:uuid', async (req, res) => {
  const { uuid, lang } = req.params;
  const upperLang = lang.toUpperCase();
  

  const [dataEvents, dataPeople] = await Promise.all([
    fetch(eventsAPI),
    fetch(personAPI)
  ]);

  const [allEventsRaw, allPeopleRaw] = await Promise.all([
    dataEvents.json(),
    dataPeople.json()
  ]);

  // Voeg afbeelding URL's toe
  const allEventsWithImages = eventImageUrls(allEventsRaw);
  const allPeopleWithImages = personImageUrls(allPeopleRaw);

  // Filter op taal
  const filteredEvents = filterEventsByLang(allEventsWithImages, upperLang);
  const filteredArtists = filterPersonsByLang(allPeopleWithImages, upperLang);

  // Zoek het specifieke event of person via uuid (in de ongefilterde lijst, zodat ook verborgen content kan worden benaderd)
  const event = allEventsWithImages.find(e => e.event.uuid === uuid);
  const person = allPeopleWithImages.find(p => p.person.uuid === uuid);

  if (!event && !person) {
    return res.status(404).send('Not found');
  }

  const title =
  (upperLang === 'EN'
    ? event?.event?.title_en
    : event?.event?.title_nl) || person?.person?.name || 'Detail';

    console.log(upperLang, event, person);

  return res.send(renderTemplate('server/views/detail-page.liquid', {
    title,
    event,
    person,
    allArtists: filteredArtists,
    allEvents: filteredEvents,
    lang: upperLang,
    currentPath: req.path,
  }));
});





// Utility function to render templates with data
const renderTemplate = (template, data) => {
  const templateData = {
    NODE_ENV: process.env.NODE_ENV || 'production', // Add environment variable to template data
    ...data, // Merge additional data
  };

  return engine.renderFileSync(template, templateData); // Render the template synchronously
};
