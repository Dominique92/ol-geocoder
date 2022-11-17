/**
 * @class MapQuest
 */
export class MapQuest {
  /**
   * @constructor
   */
  constructor() {
    this.settings = {
      url: 'https://open.mapquestapi.com/nominatim/v1/search.php',

      params: {
        q: '',
        key: '',
        format: 'json',
        addressdetails: 1,
        limit: 10,
        countrycodes: '',
        'accept-language': 'en-US',
      },
    };
  }

  getParameters(options) {
    return {
      url: this.settings.url,

      params: {
        q: options.query,
        key: options.key,
        format: 'json',
        addressdetails: 1,
        limit: options.limit || this.settings.params.limit,
        countrycodes: options.countrycodes || this.settings.params.countrycodes,

        'accept-language': options.lang || this.settings.params['accept-language'],
      },
    };
  }

  handleResponse(results) {
    if (results.length === 0) return [];

    return results.map((result) => ({
      lon: result.lon,
      lat: result.lat,

      address: {
        name: result.address.neighbourhood || '',
        road: result.address.road || '',
        postcode: result.address.postcode,
        city: result.address.city || result.address.town,
        state: result.address.state,
        country: result.address.country,
      },

      original: {
        formatted: result.display_name,
        details: result.address,
      },
    }));
  }
}
