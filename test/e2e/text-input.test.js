import { Selector } from 'testcafe';
import VARS from '../../konstants/vars.json';

const klasses = VARS.cssClasses.inputText;
const container = Selector(`#${VARS.containerId}`);
const input = container.find(`.${klasses.input}`);
const result = container.find(`.${klasses.result}`);

fixture `Control Type Glass`
  .page `../../examples/control-nominatim.html`;

test('Searching', async t => {
  await t
    .typeText(input, 'New York')
    .expect(input.value).eql('New York')
    .pressKey('enter')
    .expect(result.childElementCount).gt(1);
});
