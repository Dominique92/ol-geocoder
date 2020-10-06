/**
 * @class OpenCage
 */
export class OpenCage {
  /**
   * @constructor
   */
  constructor() {
    this.settings = {
      url: 'https://api.opencagedata.com/geocode/v1/json?',

      params: {
        q: '',
        key: '',
        limit: 10,
        countrycode: '',
        pretty: 1,
        no_annotations: 1,
      },
    };
  }

  getParameters(options) {
    return {
      url: this.settings.url,

      params: {
        q: options.query,
        key: options.key,
        limit: options.limit || this.settings.params.limit,
        countrycode: options.countrycodes || this.settings.params.countrycodes,
      },
    };
  }

  handleResponse(results) {
    if (results.results.length === 0) return [];

    return results.results.map((result) => ({
      lon: result.geometry.lng,
      lat: result.geometry.lat,

      address: {
        name: result.components.house_number || '',
        road: result.components.road || '',
        postcode: result.components.postcode,
        city: result.components.city || result.components.town,
        state: result.components.state,
        country: result.components.country,
      },

      original: {
        formatted: result.formatted,
        details: result.components,
      },
    }));
  }
}
