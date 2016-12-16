import * as C from './constants';
import U from './utils';

const klasses = C.vars.cssClasses;

/**
 * @class Html
 */
export class Html {
  /**
   * @constructor
   * @param {Function} base Base class.
   */
  constructor(base) {
    this.options = base.options;
    this.els = this.createControl();
  }

  createControl() {
    let container, containerClass, elements;

    if (this.options.targetType === C.targetType.INPUT) {
      containerClass = klasses.namespace + ' ' + klasses.inputText.container;
      container = U.createElement(
        ['div', { classname: containerClass }], Html.input);
      elements = {
        container: container,
        control: U.find('.' + klasses.inputText.control, container),
        input: U.find('.' + klasses.inputText.input, container),
        reset: U.find('.' + klasses.inputText.reset, container),
        result: U.find('.' + klasses.inputText.result, container)
      };
    } else {
      containerClass = klasses.namespace + ' ' + klasses.glass.container;
      container = U.createElement(
        ['div', { classname: containerClass }], Html.glass);
      elements = {
        container: container,
        control: U.find('.' + klasses.glass.control, container),
        button: U.find('.' + klasses.glass.button, container),
        input: U.find('.' + klasses.glass.input, container),
        reset: U.find('.' + klasses.glass.reset, container),
        result: U.find('.' + klasses.glass.result, container)
      };
    }
    //set placeholder from options
    elements.input.placeholder = this.options.placeholder;
    return elements;
  }
}

/* eslint-disable indent */
Html.glass = [
  '<div class="', klasses.glass.control, ' ', klasses.olControl, '">',
    '<button type="button" class="', klasses.glass.button, '"></button>',
    '<input type="text"',
      ' id="', C.vars.inputQueryId, '"',
      ' class="', klasses.glass.input, '"',
      ' autocomplete="off" placeholder="Search ...">',
    '<a',
      ' id="', C.vars.inputResetId, '"',
      ' class="', klasses.glass.reset, ' ', klasses.hidden, '"',
    '></a>',
  '</div>',
  '<ul class="', klasses.glass.result, '"></ul>'
].join('');

Html.input = [
  '<div class="', klasses.inputText.control, '">',
    '<input type="text"',
      ' id="', C.vars.inputQueryId, '"',
      ' class="', klasses.inputText.input, '"',
      ' autocomplete="off" placeholder="Search ...">',
    '<span class="', klasses.inputText.icon, '"></span>',
    '<button type="button"',
      ' id="', C.vars.inputResetId, '"',
      ' class="', klasses.inputText.reset, ' ', klasses.hidden, '"',
    '></button>',
  '</div>',
  '<ul class="', klasses.inputText.result, '"></ul>'
].join('');
/* eslint-enable indent */
