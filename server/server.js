import 'dotenv/config';
import { App } from '@tinyhttp/app'; // Remove json import
import bodyParser from 'body-parser'; // Import json middleware from body-parser
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';
// import events from './events.json' assert { type: 'json' };
// import artists from './artists.json' assert { type: 'json' };

const wordPressAPI = `https://framerframed.nl/en/wp-json/wp/v2/pages`;
const eventsAPI = `https://archive.framerframed.nl/api/ff/events`;
const personAPI = `https://archive.framerframed.nl/api/ff/persons`;
const eventTypesAPI = `https://archive.framerframed.nl/api/ff/eventtypes`;

const engine = new Liquid({
  extname: '.liquid',
});

const app = new App();

app
  .use(logger())
  .use(bodyParser.urlencoded({ extended: true })) // Use body-parser's json middleware
  .use('/', sirv('dist'))
  .listen(3000, () => console.log('Server available on http://localhost:3000'));

  app.get('/', async (req, res) => {
    const selectedType = req.query.eventType;

    // Data van events en artists ophalen
    const dataEvents = await fetch(eventsAPI)
    const allEvents = await dataEvents.json();
    console.log(allEvents);

    const dataEventTypes = await fetch(eventTypesAPI);
    const allEventTypes = await dataEventTypes.json();

    const dataPeople = await fetch(personAPI);
    const allArtists = await dataPeople.json();


    return res.send(renderTemplate('server/views/index.liquid', { title: 'Home', allEvents, allArtists, allEventTypes, selectedType  }));
  });

  app.get('/')



const renderTemplate = (template, data) => {
  const templateData = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    ...data,
  }

  return engine.renderFileSync(template, templateData);
};



