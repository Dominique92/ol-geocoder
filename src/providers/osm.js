/**
 * @class OpenStreet
 */
export default class OpenStreet {
  /**
   * @constructor
   */
  constructor(options) {
    this.settings = {
      url: 'https://nominatim.openstreetmap.org/search',
      ...options, // Allow custom URL for osm provider https://github.com/Dominique92/ol-geocoder/issues/266

      params: {
        q: '',
        format: 'json',
        addressdetails: 1,
        limit: 10,
        countrycodes: '',
        viewbox: '',
        'accept-language': 'en-US',
      },
    };
  }

  getParameters(opt) {
    return {
      url: this.settings.url,

      params: {
        q: opt.query,
        format: this.settings.params.format,
        addressdetails: this.settings.params.addressdetails,
        limit: opt.limit || this.settings.params.limit,
        countrycodes: opt.countrycodes || this.settings.params.countrycodes,
        viewbox: opt.viewbox || this.settings.params.viewbox,
        'accept-language': opt.lang || this.settings.params['accept-language'],
      },
    };
  }

  handleResponse(results) {
    if (results.length === 0) return [];

    return results.map((result) => ({
      lon: result.lon,
      lat: result.lat,
      bbox: result.boundingbox,

      address: {
        name: result.display_name,
        road: result.address.road || '',
        houseNumber: result.address.house_number || '',
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