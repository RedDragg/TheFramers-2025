import 'dotenv/config';
import { App } from '@tinyhttp/app'; // Remove json import
import bodyParser from 'body-parser'; // Import json middleware from body-parser
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

const wordPressAPI = `https://framerframed.nl/en/wp-json/wp/v2/pages`;
const eventsAPI = `https://archive.framerframed.nl/api/ff/events`;
const personAPI = `https://archive.framerframed.nl/api/ff/persons`;
const eventTypesAPI = `https://archive.framerframed.nl/api/ff/eventtypes`;

const engine = new Liquid({
  extname: '.liquid',
});

const app = new App();

// Utility function
function attachImageUrls(events) {
  return events.map(event => {
    const assetRel = event.relationships?.find(rel => rel.node === 'Asset');
    const imageUrl = assetRel ? `https://archive.framerframed.nl/assets/${assetRel.uuid}/hd.webp` : null;
    return {
      ...event,
      imageUrl
    };
  });
}

app
  .use(logger())
  .use(bodyParser.urlencoded({ extended: true })) // Use body-parser's json middleware
  .use('/', sirv('dist'))
  .listen(3000, () => console.log('Server available on http://localhost:3000'));

  app.get('/', async (req, res) => {
    // Data van events en artists ophalen
    const dataEvents = await fetch(eventsAPI)
    const allEvents = await dataEvents.json();
    // console.log(allEvents);

    const dataEventTypes = await fetch(eventTypesAPI);
    const allEventTypes = await dataEventTypes.json();
    const filteredEvents = allEvents.filter(
      (e) => e.event && e.event.title_nl && e.event.title_nl.trim() !== ''
    );

    const eventsWithImages = attachImageUrls(filteredEvents);

    const dataPeople = await fetch(personAPI);
    const allArtists = await dataPeople.json();

    return res.send(renderTemplate('server/views/index.liquid', { title: 'Home', allEvents: eventsWithImages, allArtists, allEventTypes  }));
  });

  app.get('/archive', async (req, res) => {
    const selectedType = req.query.eventType;

    // Data van events en artists ophalen
    const dataEvents = await fetch(eventsAPI)
    const allEvents = await dataEvents.json();

    console.log(allEvents);

    const dataEventTypes = await fetch(eventTypesAPI);
    const allEventTypes = await dataEventTypes.json();
    let filteredEvents = allEvents.filter(
      (e) => e.event && e.event.title_nl && e.event.title_nl.trim() !== ''
    );
    
    if (selectedType && selectedType !== 'all') {
      filteredEvents = filteredEvents.filter(
        (e) => e.event.type_nl === selectedType
      );
    }

    const eventsWithImages = attachImageUrls(filteredEvents);

    const dataPeople = await fetch(personAPI);
    const allArtists = await dataPeople.json();

    return res.send(renderTemplate('server/views/archive.liquid', { title: 'Archive', allEvents: eventsWithImages, allArtists, allEventTypes, selectedType }));
  });

  app.get('/archive/:uuid', async (req, res) => {
    const eventUuid = req.params.uuid;
  
    // Fetch all events (or ideally cache them)
    const response = await fetch(eventsAPI);
    const allEvents = await response.json();

    // Find the event with the matching UUID
    const event = allEvents.find(e => e.event.uuid === eventUuid);
    console.log(event)
  
    if (!event) {
      return res.status(404).send('Event not found');
    }
  
    // You can also load additional data here if needed
    // const dataPeople = await fetch(personAPI);
    // const allArtists = await dataPeople.json();
  
    return res.send(
      renderTemplate('server/views/detail.liquid', {
        title: event.event.title_nl,
        event,
        // allArtists,
      })
    );
  });



const renderTemplate = (template, data) => {
  const templateData = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    ...data,
  }

  return engine.renderFileSync(template, templateData);
};



