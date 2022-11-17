import { Selector } from 'testcafe';

import { VARS, TARGET_TYPE } from '../../../konstants';

export default class Page {
  constructor(control) {
    const container = Selector(`#${VARS.containerId}`);

    this.klasses = null;

    if (control === TARGET_TYPE.GLASS) {
      this.klasses = VARS.cssClasses.glass;

      this.button = Selector(`#${VARS.buttonControlId}`);
      this.control = container.find(`.${this.klasses.control}`);
      this.input = container.find(`.${this.klasses.input}`);
    } else {
      this.klasses = VARS.cssClasses.inputText;
      this.input = Selector(`#${VARS.inputQueryId}`);
    }

    this.result = container.find(`.${this.klasses.result}`);
  }
}
