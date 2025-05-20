import 'dotenv/config';
import { App } from '@tinyhttp/app'; // Remove json import
import bodyParser from 'body-parser'; // Import json middleware from body-parser
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

// Verkrijg het pad van de huidige map
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Gebruik het pad om het bestand te maken
// const file = join(__dirname, 'db.json');
// const adapter = new JSONFile(file);

const collectionAPI = `https://archive.framerframed.nl/api/collections`;

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
    const dataCollection = await fetch(collectionAPI);
    const allCollections = await dataCollection.json();
    // console.log(allCollections)

    return res.send(renderTemplate('server/views/index.liquid', { title: 'Home', allCollections: allCollections }));
  });





const renderTemplate = (template, data) => {
  const templateData = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    ...data,
  }

  return engine.renderFileSync(template, templateData);
};



