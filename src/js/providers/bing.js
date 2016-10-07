/**
 * @class Bing
 */
export class Bing {
  /**
   * @constructor
   */
  constructor() {
    this.settings = {
      url: '//dev.virtualearth.net/REST/v1/Locations',
      callbackName: 'jsonp',
      params: {
        query: '',
        key: '',
        includeNeighborhood: 0,
        maxResults: 10
      }
    };
  }

  getParameters(options) {
    return {
      url: this.settings.url,
      callbackName: this.settings.callbackName,
      params: {
        query: options.query,
        key: options.key,
        includeNeighborhood: options.includeNeighborhood ||
            this.settings.params.includeNeighborhood,
        maxResults: options.maxResults || this.settings.params.maxResults
      }
    };
  }

  handleResponse(results) {
    return results.map(result => ({
      lon: result.point.coordinates[1],
      lat: result.point.coordinates[0],
      address: {
        name: result.name
      },
      original: {
        formatted: result.address.formattedAddress,
        details: result.address
      }
    }));
  }
}
