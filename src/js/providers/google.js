import utils from '../utils';

/**
 * @class Google
 */
export class Google {
  /**
   * @constructor
   */
  constructor() {

    this.settings = {
      url: '//maps.googleapis.com/maps/api/geocode/json',
      params: {
        address: '',
        key: '',
        language: 'en-US'
      }
    };
  }

  getParameters(options) {
    return {
      url: this.settings.url,
      params: {
        address: options.query,
        key: options.key,
        language: options.lang || this.settings.params.language
      }
    };
  }

  handleResponse(results) {
    const name = [
          'point_of_interest',
          'establishment',
          'natural_feature',
          'airport'
        ],
        road = [
          'street_address',
          'route',
          'sublocality_level_5',
          'intersection'
        ],
        postcode = ['postal_code'],
        city = ['locality'],
        state = ['administrative_area_level_1'],
        country = ['country'];

    /*
     * @param {Array} details - address_components
     */
    const getDetails = details => {
      let parts = {
        name: '',
        road: '',
        postcode: '',
        city: '',
        state: '',
        country: ''
      };
      details.forEach(detail => {
        if (utils.anyMatchInArray(detail.types, name)) {
          parts.name = detail.long_name;
        } else if (utils.anyMatchInArray(detail.types, road)) {
          parts.road = detail.long_name;
        } else if (utils.anyMatchInArray(detail.types, postcode)) {
          parts.postcode = detail.long_name;
        } else if (utils.anyMatchInArray(detail.types, city)) {
          parts.city = detail.long_name;
        } else if (utils.anyMatchInArray(detail.types, state)) {
          parts.state = detail.long_name;
        } else if (utils.anyMatchInArray(detail.types, country)) {
          parts.country = detail.long_name;
        }
      });
      return parts;
    };

    let array = [];

    results.forEach(result => {
      let details = getDetails(result.address_components);
      if (utils.anyItemHasValue(details)) {
        array.push({
          lon: result.geometry.location.lng,
          lat: result.geometry.location.lat,
          address: {
            name: details.name,
            postcode: details.postcode,
            road: details.road,
            city: details.city,
            state: details.state,
            country: details.country
          },
          original: {
            formatted: result.formatted_address,
            details: result.address_components
          }
        });
      }
    });

    return array;
  }
}
