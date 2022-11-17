/**
 * @class Bing
 */
export class Bing {
  /**
   * @constructor
   */
  constructor() {
    this.settings = {
      url: 'https://dev.virtualearth.net/REST/v1/Locations',
      callbackName: 'jsonp',

      params: {
        query: '',
        key: '',
        includeNeighborhood: 0,
        maxResults: 10,
      },
    };
  }

  getParameters(options) {
    return {
      url: this.settings.url,
      callbackName: this.settings.callbackName,

      params: {
        query: options.query,
        key: options.key,

        includeNeighborhood:
          options.includeNeighborhood || this.settings.params.includeNeighborhood,

        maxResults: options.maxResults || this.settings.params.maxResults,
      },
    };
  }

  handleResponse(results) {
    const { resources } = results.resourceSets[0];

    if (resources.length === 0) return [];

    return resources.map((result) => ({
      lon: result.point.coordinates[1],
      lat: result.point.coordinates[0],

      address: {
        name: result.name,
      },

      original: {
        formatted: result.address.formattedAddress,
        details: result.address,
      },
    }));
  }
}
