import { TARGET_TYPE } from '../../../konstants';

import Page from './page';

const page = new Page(TARGET_TYPE.INPUT);

// eslint-disable-next-line no-unused-expressions
fixture`Control Type Glass`.page`../pages/control-input.html`;

test('Searching', async (t) => {
  await t
    .typeText(page.input, 'New York')
    .expect(page.input.value)
    .eql('New York')
    .pressKey('enter')
    .expect(page.result.childElementCount)
    .gt(1);
});
