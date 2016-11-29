/**
 * @class Here
 */
export class Here {
  /**
   * @constructor
   */
  constructor() {

    this.settings = {
      url: '//geocoder.api.here.com/6.2/geocode.json',
      params: {
				searchtext: '',
				gen: 9,
				language: 'en',
				app_id: '',
				app_code: '',
				addressattributes: 'ctr,sta,cty,cit,dis,sdi,str,hnr,pst,aln,add'
			}
    };
  }

  getParameters(options) {
    return {
      url: this.settings.url,
      params: {
				searchtext: options.query,
				gen: 9,
				language: options.lang || this.settings.params.language,
				app_id: options.key.split("#")[0],
				app_code: options.key.split("#")[1],
				addressattributes: this.settings.params.addressattributes
      }
    };
  }

  handleResponse(results) {
		var array = [];

	  results.forEach(function (result) {
			array.push({
				lon: result.Location.DisplayPosition.Longitude,
				lat: result.Location.DisplayPosition.Latitude,
				address: {
					name: result.Location.Address.Label,
					postcode: result.Location.Address.PostalCode,
					road: '',
					city: result.Location.Address.City,
					state: result.Location.Address.State,
					country: result.Location.Address.Country
				},
				original: {
					formatted: result.Location.Address.Label,
					details: result.Location.Address.Label
				}
			});
	  });	  
		
		return array;    
  }
}
