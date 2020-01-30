import { VARS, TARGET_TYPE } from 'konstants';
import { find, createElement } from 'helpers/dom';

const klasses = VARS.cssClasses;

/**
 * @class Html
 */
export class HtmlExtended {
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

    if (this.options.targetType === TARGET_TYPE.INPUT) {
      containerClass = klasses.namespace + ' ' + klasses.inputText.container;
      container = createElement(
        ['div', { id: VARS.containerId, classname: containerClass }],
        HtmlExtended.input
      );
      elements = {
        container: container,
        control: find('.' + klasses.inputText.control, container),
        input: find('.' + klasses.inputText.input, container),
        reset: find('.' + klasses.inputText.reset, container),
        result: find('.' + klasses.inputText.result, container),
      };
    } else {
      containerClass = `${klasses.namespace} ${klasses.glass.container}`;
      container = createElement(
        ['div', { id: VARS.containerId, classname: containerClass }],
        HtmlExtended.glass
      );
      elements = {
        container: container,
        control: find('.' + klasses.glass.control, container),
        button: find('.' + klasses.glass.button, container),
        input: find('.' + klasses.glass.input, container),
        reset: find('.' + klasses.glass.reset, container),
        result: find('.' + klasses.glass.result, container),
      };
    }
    //set placeholder from options
    elements.input.placeholder = this.options.placeholder;
    return elements;
  }
}

/* eslint-disable indent */
HtmlExtended.glass = [
  '<div class="',
  klasses.glass.control,
  ' ',
  klasses.olControl,
  '">',
  '<button type="button"',
  ' id="',
  VARS.buttonControlId,
  '"',
  ' class="',
  klasses.glass.button,
  '"></button>',
  '<input type="text"',
  ' id="',
  VARS.inputQueryIdExt,
  '"',
  ' class="',
  klasses.glass.input,
  '"',
  ' autocomplete="off" placeholder="Search ...">',
  '<a',
  ' id="',
  VARS.inputResetId,
  '"',
  ' class="',
  klasses.glass.reset,
  ' ',
  klasses.hidden,
  '"',
  '></a>',
  '</div>',
  '<ul class="',
  klasses.glass.result,
  '"></ul>',
].join('');

HtmlExtended.input = [
  '<div class="',
  klasses.inputText.control,
  '">',
  '<input type="text"',
  ' id="',
  VARS.inputQueryIdExt,
  '"',
  ' class="',
  klasses.inputText.input,
  '"',
  ' autocomplete="off" placeholder="Search ...">',
  '<span class="',
  klasses.inputText.icon,
  '"></span>',
  '<button type="button"',
  ' id="',
  VARS.inputResetId,
  '"',
  ' class="',
  klasses.inputText.reset,
  ' ',
  klasses.hidden,
  '"',
  '></button>',
  '</div>',
  '<ul class="',
  klasses.inputText.result,
  '"></ul>',
].join('');
/* eslint-enable indent */
