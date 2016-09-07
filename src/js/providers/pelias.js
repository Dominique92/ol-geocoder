/**
 * @class Pelias
 */
export class Pelias {
  /**
   * @constructor
   */
  constructor() {

    this.settings = {
      url: '//search.mapzen.com/v1/search',
      params: {
        text: '',
        key: '',
        size: 10
      }
    };
  }

  getParameters(options) {
    return {
      url: this.settings.url,
      params: {
        text: options.query,
        key: options.key,
        size: options.limit || this.settings.params.size
      }
    };
  }

  handleResponse(results) {
    return results.map(result => ({
      lon: result.geometry.coordinates[0],
      lat: result.geometry.coordinates[1],
      address: {
        name: result.properties.name,
        house_number: result.properties.housenumber,
        postcode: result.properties.postalcode,
        road: result.properties.street,
        city: result.properties.city,
        state: result.properties.region,
        country: result.properties.country
      },
      original: {
        formatted: result.properties.label,
        details: result.properties
      }
    }));
  }
}
