import base from './base_.js';
import { CONTROL_TYPE } from './constants.js';

export default function (type = CONTROL_TYPE.NOMINATIM, options = {}) {
  const { initialize, getLayer, getSource, setProvider, setProviderKey } = base(type, options);

  initialize();

  return { getLayer, getSource, setProvider, setProviderKey };
}
