import { PROVIDERS } from '../../../konstants';

import Page from './page';

const page = new Page();

// eslint-disable-next-line no-unused-expressions
fixture`OSM`.page`../pages/providers.html`;

test('Searching', async (t) => {
  await t
    .typeText(page.provider, PROVIDERS.OSM)
    .expect(page.provider.value)
    .eql(PROVIDERS.OSM)
    .typeText(page.input, 'New York')
    .expect(page.input.value)
    .eql('New York')
    .pressKey('enter')
    // .debug()
    .expect(page.result.childElementCount)
    .gt(1);
});
