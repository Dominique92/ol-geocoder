import { Selector } from 'testcafe';

import { VARS } from '../../../konstants';

export default class Page {
  constructor() {
    const klasses = VARS.cssClasses.inputText;
    const container = Selector(`#${VARS.containerId}`);

    this.input = Selector(`#${VARS.inputQueryId}`);
    this.result = container.find(`.${klasses.result}`);
    this.provider = Selector(`#provider`);
    this.key = Selector(`#key`);
  }
}
