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
    // Data van events en artists ophalen
    const dataEvents = await fetch(eventsAPI)
    const allEvents = await dataEvents.json();
    console.log(allEvents);

    const dataEventTypes = await fetch(eventTypesAPI);
    const allEventTypes = await dataEventTypes.json();

    const dataPeople = await fetch(personAPI);
    const allArtists = await dataPeople.json();


    return res.send(renderTemplate('server/views/index.liquid', { title: 'Home', allEvents: allEvents, allArtists: allArtists, allEventTypes: allEventTypes  }));
  });

  app.post('/archives/:type/show-artists', (req, res) => {
    const type = req.params.type.toLowerCase();
    const { event_id } = req.body;
    console.log(event_id)
  
    const event = events.events.find(ev => ev.node.ff_id == event_id);
    const allArtists = artists.artists;
  
    if (!event) {
      console.log('Event not found');
      return res.redirect('/');
    }
  
    console.log(`--- Artists related to event: ${event.node.title_NL} ---`);
    event.rels.forEach(rel => {
      const relatedArtist = allArtists.find(artist => artist.ff_id === rel.ff_id);
      if (relatedArtist) {
        console.log(`✔️ ${relatedArtist.name} (ff_id: ${relatedArtist.ff_id})`);
      } else {
        console.log(`❌ No artist found for relation uuid: ${rel.uuid}`);
      }
    });
  
    return res.redirect('/archives/:type');
  });

app.post('/archives/filter', (req, res) => {
  const searchQuery = req.body.search;
  const searchType = req.body.type;
  console.log(searchQuery);
  console.log(searchType);

  return res.redirect(`/archives/:type/?search=${searchQuery}&type=${searchType}`);
})

app.get('/archives/:type', (req, res) => {
  const type = req.params.type.toLowerCase();
  console.log(type)

  const allEvents = events.events;
  const allArtists = artists.artists;

  let filteredEvents = [];
  let filteredArtists = [];

  if (type === 'all') {
    filteredEvents = allEvents;
    filteredArtists = allArtists;
  } else if (type === 'events') {
    filteredEvents = allEvents;
  } else if (type === 'artists') {
    filteredArtists = allArtists;
  } else {
    // Filter alleen events met die specifieke type
    filteredEvents = allEvents.filter(event => event.type.toLowerCase() === type);
  }

  return res.send(renderTemplate('server/views/archives.liquid', {
    title: 'Archives',
    allEvents: filteredEvents,
    allArtists: filteredArtists,
    type: type,
    query: '',
    type: type
  }));
});



const renderTemplate = (template, data) => {
  const templateData = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    ...data,
  }

  return engine.renderFileSync(template, templateData);
};



