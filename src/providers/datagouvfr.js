/**
 * @class DataGouvFr
 */
export class DataGouvFr {
  /**
   * @constructor
   */
  constructor() {
    this.settings = {
      url: 'https://api-adresse.data.gouv.fr/search/',
      params: {
        q: '',
        limit: 10
      }
    };
  }

  getParameters(options) {
    return {
      url: this.settings.url,
      params: {
        q: options.query,
        limit: options.limit || this.settings.params.limit
      }
    };
  }

  handleResponse(results) {
    return results.map(result => ({
      lon: result.geometry.coordinates[0],
      lat: result.geometry.coordinates[1],
      address: {
        name: result.properties.name || '',
        city: result.properties.city || '',
        postcode: result.properties.postcode
      },
      original: {
        formatted: result.properties.label,
        details: result.properties.label
      }
    }));
  }
}
