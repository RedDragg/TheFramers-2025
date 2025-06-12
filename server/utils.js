
/* /////////////////////////////////////// */
         /* 🪩🪩🪩 Utils 🪩🪩🪩 */
/* /////////////////////////////////////// */



// Utility function to add image URLs to events
export function eventImageUrls(events) {
    return events.map(event => {
      const assetRel = event.relationships?.find(rel => rel.node === 'Asset');
      const imageUrl = assetRel 
        ? `https://archive.framerframed.nl/assets/${assetRel.uuid}/hd.webp`
        : undefined 
      return {
        ...event,
        imageUrl
      };
    });
  }
  
  // Utility function to add image URLs to people
  export function personImageUrls(people) {
    return people.map(person => {
      const assetRel = person.relationships?.find(rel => rel.node === 'Asset');
      const imageUrl = assetRel 
        ? `https://archive.framerframed.nl/assets/${assetRel.uuid}/hd.webp`
        : undefined
      return {
        ...person,
        imageUrl
      };
    });
  }
  
  export function filterEventsByLang(events, lang) {
    return events.filter(e => {
      if (!e.event) return false;
      const title = lang === 'EN' ? e.event.title_en : e.event.title_nl;
      return title && title.trim() !== '';
    });
  }
  
  export function filterPersonsByLang(persons, lang) {
    return persons.filter(p => {
      if (!p.person) return false;
      const bio = lang === 'EN' ? p.person.bio_en : p.person.bio_nl;
      return bio && bio.trim() !== '';
    });
  }

  export function getEventTypeName(event, lang) {
    if (!event || !event.event) return '';
    return lang === 'EN' ? event.event.type_en : event.event.type_nl;
  }
  
  