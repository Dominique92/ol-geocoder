import { Selector } from 'testcafe';
import VARS from '../../konstants/vars.json';

const klasses = VARS.cssClasses.glass;
const container = Selector(`#${VARS.containerId}`);
const button = Selector(`#${VARS.buttonControlId}`);
const control = container.find(`.${klasses.control}`);
const input = container.find(`.${klasses.input}`);
const result = container.find(`.${klasses.result}`);

fixture `Control Type Glass`
  .page `../../examples/control-glass.html`;

test('Searching', async t => {
  await t
    .click(button)
    .expect(control.hasClass(klasses.expanded)).ok()
    .typeText(input, 'New York')
    .expect(input.value).eql('New York')
    .pressKey('enter')
    .expect(result.childElementCount).gt(1);
});
