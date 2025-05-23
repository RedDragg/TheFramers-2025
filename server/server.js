import 'dotenv/config';
import { App } from '@tinyhttp/app'; // Remove json import
import bodyParser from 'body-parser'; // Import json middleware from body-parser
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';
import events from './events.json' assert { type: 'json' };
import artists from './artists.json' assert { type: 'json' };

const wordPressAPI = `https://framerframed.nl/en/wp-json/wp/v2/pages`;


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
  const allEvents = events.events;
  const allArtists = artists.artists;

  // Search query and filter opvragen uit URL
  const searchQuery = req.query.search?.toLowerCase().trim() || '';
  const filterType = req.query.type || 'all';

  let filteredEvents = [];
  let filteredArtists = [];

  // Show all if no search, but based on type
  if (!searchQuery) {
    if (filterType === 'all' || filterType === 'events') {
      filteredEvents = allEvents;
    }

    if (filterType === 'all' || filterType === 'artists') {
      filteredArtists = allArtists;
    }
  } else {
    // Filter by search query
    if (filterType === 'all' || filterType === 'events') {
      filteredEvents = allEvents.filter(event =>
        event.node.title_NL.toLowerCase().includes(searchQuery)
      );
    }

    if (filterType === 'all' || filterType === 'artists') {
      filteredArtists = allArtists.filter(artist =>
        artist.name.toLowerCase().includes(searchQuery)
      );
    }
  }

    return res.send(renderTemplate('server/views/index.liquid', { title: 'Home', allEvents: filteredEvents, allArtists: filteredArtists, query: searchQuery, type: filterType  }));
  });

  app.post('/show-artists', (req, res) => {
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
  
    return res.redirect('/');
  });

app.post('/filter', (req, res) => {
  const searchQuery = req.body.search;
  const searchType = req.body.type;
  console.log(searchQuery);
  console.log(searchType);

  return res.redirect(`/?search=${searchQuery}&type=${searchType}`);
})









const renderTemplate = (template, data) => {
  const templateData = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    ...data,
  }

  return engine.renderFileSync(template, templateData);
};



