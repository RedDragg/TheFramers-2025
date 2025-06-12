/* ///////////////////// */
/* 🪩🪩🪩 Server.js 🪩🪩🪩 */
/* ///////////////////// */

import 'dotenv/config'; // Load environment variables from a .env file
import { App } from '@tinyhttp/app'; // Tinyhttp app framework
import bodyParser from 'body-parser'; // Middleware for parsing request bodies
import { logger } from '@tinyhttp/logger'; // Middleware for logging HTTP requests
import { Liquid } from 'liquidjs'; // Template engine for rendering views
import sirv from 'sirv'; // Static file server middleware
import { eventImageUrls, personImageUrls, filterEventsByLang, filterPersonsByLang } from './utils.js';

// API endpoints for fetching data
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


/* /////////////////////////////////////// */
/* 🐆🐆🐆 Route: Home page - all data 🐆🐆🐆 */
/* /////////////////////////////////////// */

app.get('/:lang', async (req, res) => {
  try {
    const lang = req.params.lang.toUpperCase();
    const view = req.query.view || 'categories'; // default naar 'all-data' als het ontbreekt

    const [dataEvents, dataEventTypes, dataPeople] = await Promise.all([
      fetch(eventsAPI).catch(err => { throw new Error(`Failed to fetch events: ${err.message}`); }),
      fetch(eventTypesAPI).catch(err => { throw new Error(`Failed to fetch event types: ${err.message}`); }),
      fetch(personAPI).catch(err => { throw new Error(`Failed to fetch persons: ${err.message}`); })
    ]);

    const [allEventsRaw, allEventTypes, allPeople] = await Promise.all([
      dataEvents.json().catch(err => { throw new Error(`Failed to parse events JSON: ${err.message}`); }),
      dataEventTypes.json().catch(err => { throw new Error(`Failed to parse event types JSON: ${err.message}`); }),
      dataPeople.json().catch(err => { throw new Error(`Failed to parse persons JSON: ${err.message}`); })
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
      view
    }));
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});


/* /////////////////////////////// */
/* 🐆🐆🐆 Route: Archive page 🐆🐆🐆 */
/* /////////////////////////////// */
app.get('/:lang/archive/type/:eventType', async (req, res) => {
  try {
    const { lang, eventType } = req.params;
    const queryEventType = req.query.eventType;

    const selectedEventRaw = queryEventType || eventType || 'all';
    const selectedEvent = selectedEventRaw.toLowerCase() === 'all' ? 'all' : selectedEventRaw;
    const upperLang = lang.toUpperCase();

    const breadcrumbs = [
      { name: 'Home', url: '/', icon: 'home' },
    ];

    const [dataEvents, dataEventTypes, dataPeople] = await Promise.all([
      fetch(eventsAPI).catch(err => { throw new Error(`Failed to fetch events: ${err.message}`); }),
      fetch(eventTypesAPI).catch(err => { throw new Error(`Failed to fetch event types: ${err.message}`); }),
      fetch(personAPI).catch(err => { throw new Error(`Failed to fetch persons: ${err.message}`); })
    ]);

    const [allEventsRaw, allEventTypes, allPeople] = await Promise.all([
      dataEvents.json().catch(err => { throw new Error(`Failed to parse events JSON: ${err.message}`); }),
      dataEventTypes.json().catch(err => { throw new Error(`Failed to parse event types JSON: ${err.message}`); }),
      dataPeople.json().catch(err => { throw new Error(`Failed to parse persons JSON: ${err.message}`); })
    ]);

    const allEvents = eventImageUrls(allEventsRaw);
    const filteredEvents = filterEventsByLang(allEvents, upperLang)
      .filter(e => {
        const type = upperLang === 'EN' ? e.event.type_en : e.event.type_nl;
        return selectedEvent === 'all' || type === selectedEvent;
      });

    const filteredArtists = personImageUrls(filterPersonsByLang(allPeople, upperLang));

    return res.send(renderTemplate('server/views/archive.liquid', {
      breadcrumbs,
      title: 'Archive',
      allEvents: filteredEvents,
      allArtists: filteredArtists,
      allEventTypes,
      selectedEvent,
      lang: upperLang,
      currentPath: req.path,
    }));
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});


/* /////////////////////////////// */
/* 🐆🐆🐆 Route: Detail page 🐆🐆🐆 */
/* /////////////////////////////// */
app.get('/:lang/archive/:eventType/:uuid', async (req, res) => {
  try {
    const { uuid, lang } = req.params;
    const selectedEvent = req.params.eventType || 'all';
    const upperLang = lang.toUpperCase();

    const breadcrumbs = [
      { name: 'Home', url: '/', icon: 'home' },
      { name: upperLang === 'EN' ? 'Overview' : 'Overzicht', url: `/${upperLang.toLowerCase()}/archive/type/${selectedEvent}`, icon: 'overview' },
    ];

    const [dataEvents, dataPeople] = await Promise.all([
      fetch(eventsAPI).catch(err => { throw new Error(`Failed to fetch events: ${err.message}`); }),
      fetch(personAPI).catch(err => { throw new Error(`Failed to fetch persons: ${err.message}`); })
    ]);

    const [allEventsRaw, allPeopleRaw] = await Promise.all([
      dataEvents.json().catch(err => { throw new Error(`Failed to parse events JSON: ${err.message}`); }),
      dataPeople.json().catch(err => { throw new Error(`Failed to parse persons JSON: ${err.message}`); })
    ]);

    const allEventsWithImages = eventImageUrls(allEventsRaw);
    const allPeopleWithImages = personImageUrls(allPeopleRaw);

    const filteredEvents = filterEventsByLang(allEventsWithImages, upperLang);
    const filteredArtists = filterPersonsByLang(allPeopleWithImages, upperLang);

    const event = allEventsWithImages.find(e => e.event.uuid === uuid);
    const person = allPeopleWithImages.find(p => p.person.uuid === uuid);

    if (!event && !person) {
      return res.status(404).send('Not found');
    }

    const title =
      (upperLang === 'EN'
        ? event?.event?.title_en
        : event?.event?.title_nl) || person?.person?.name || 'Detail';

    return res.send(renderTemplate('server/views/detail-page.liquid', {
      breadcrumbs,
      title,
      event,
      person,
      allArtists: filteredArtists,
      allEvents: filteredEvents,
      lang: upperLang,
      currentPath: req.path,
    }));
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/:lang/archive/person/:uuid', async (req, res) => {
  try {
    const { uuid, lang } = req.params;
    const upperLang = lang.toUpperCase();

    const breadcrumbs = [
      { name: 'Home', url: '/', icon: 'home' },
      { name: upperLang === 'EN' ? 'Overview' : 'Overzicht', url: `/${upperLang.toLowerCase()}/archive/type/all`, icon: 'overview' },
    ];

    const [dataEvents, dataPeople] = await Promise.all([
      fetch(eventsAPI).catch(err => { throw new Error(`Failed to fetch events: ${err.message}`); }),
      fetch(personAPI).catch(err => { throw new Error(`Failed to fetch persons: ${err.message}`); })
    ]);

    const [allEventsRaw, allPeopleRaw] = await Promise.all([
      dataEvents.json().catch(err => { throw new Error(`Failed to parse events JSON: ${err.message}`); }),
      dataPeople.json().catch(err => { throw new Error(`Failed to parse persons JSON: ${err.message}`); })
    ]);

    const allEventsWithImages = eventImageUrls(allEventsRaw);
    const allPeopleWithImages = personImageUrls(allPeopleRaw);

    const filteredEvents = filterEventsByLang(allEventsWithImages, upperLang);
    const filteredArtists = filterPersonsByLang(allPeopleWithImages, upperLang);

    const event = allEventsWithImages.find(e => e.event.uuid === uuid);
    const person = allPeopleWithImages.find(p => p.person.uuid === uuid);

    if (!event && !person) {
      return res.status(404).send('Not found');
    }

    const title =
      (upperLang === 'EN'
        ? event?.event?.title_en
        : event?.event?.title_nl) || person?.person?.name || 'Detail';

    return res.send(renderTemplate('server/views/detail-page.liquid', {
      breadcrumbs,
      title,
      event,
      person,
      allArtists: filteredArtists,
      allEvents: filteredEvents,
      lang: upperLang,
      currentPath: req.path,
    }));
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});


// Utility function to render templates with data
const renderTemplate = (template, data) => {
  try {
    const templateData = {
      NODE_ENV: process.env.NODE_ENV || 'production',
      ...data,
    };

    return engine.renderFileSync(template, templateData);
  } catch (error) {
    console.error(`Failed to render template: ${error.message}`);
    throw new Error('Template rendering failed');
  }
};
