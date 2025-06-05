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

function filterEventsByLang(events, lang) {
  return events.filter(e => {
    if (!e.event) return false;
    const title = lang === 'EN' ? e.event.title_en : e.event.title_nl;
    return title && title.trim() !== '';
  });
}

function filterPersonsByLang(persons, lang) {
  return persons.filter(p => {
    if (!p.person) return false;
    const bio = lang === 'EN' ? p.person.bio_en : p.person.bio_nl;
    return bio && bio.trim() !== '';
  });
}

function filterEventsAndPersonsByLang(data, lang) {
  return {
    events: filterEventsByLang(data.events, lang),
    persons: filterPersonsByLang(data.persons, lang)
  };
}


// Middleware setup
app
  .use(logger()) // Log HTTP requests
  .use(bodyParser.urlencoded({ extended: true })) // Parse URL-encoded request bodies
  .use('/', sirv('dist')) // Serve static files from the 'dist' directory
  .listen(3000, () => console.log('Server available on http://localhost:3000')); // Start the server on port 3000

// Route: Home page
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
app.get('/:lang/archive/type/:eventType', async (req, res) => {
  const { eventType, lang } = req.params;
  const selectedEvent = eventType || 'all';
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
    .filter(e => selectedEvent === 'all' || getEventTypeName(e, upperLang) === selectedEvent);

  const filteredArtists = personImageUrls(filterPersonsByLang(allPeople, upperLang));


  return res.send(renderTemplate('server/views/archive.liquid', { 
    title: 'Archive', 
    allEvents: filteredEvents, 
    allArtist: filteredArtists, 
    allEventTypes, 
    selectedEvent 
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

  return res.send(renderTemplate('server/views/details.liquid', {
    title:
      (upperLang === 'EN'
        ? event?.event?.title_en
        : event?.event?.title_nl) || person?.person?.name || 'Detail',
    event,
    person,
    allArtists: filteredArtists,
    allEvents: filteredEvents,
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
