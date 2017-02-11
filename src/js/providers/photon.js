/**
 * @class Photon
 */
export class Photon {
  /**
   * @constructor
   */
  constructor() {

    this.settings = {
      url: '//photon.komoot.de/api/',
      params: {
        q: '',
        limit: 10,
        lang: 'en'
      },
      langs: ['de', 'it', 'fr', 'en']
    };
  }

  getParameters(options) {
    options.lang = options.lang.toLowerCase();

    return {
      url: this.settings.url,
      params: {
        q: options.query,
        limit: options.limit || this.settings.params.limit,
        lang: this.settings.langs.indexOf(options.lang) > -1 ?
          options.lang : this.settings.params.lang
      }
    };
  }

  handleResponse(results) {
    return results.map(result => ({
      lon: result.geometry.coordinates[0],
      lat: result.geometry.coordinates[1],
      address: {
        name: result.properties.name,
        postcode: result.properties.postcode,
        city: result.properties.city,
        state: result.properties.state,
        country: result.properties.country
      },
      original: {
        formatted: result.properties.name,
        details: result.properties
      }
    }));
  }
}
