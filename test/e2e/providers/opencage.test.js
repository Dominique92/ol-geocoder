import '../../env';
import { PROVIDERS } from '../../../konstants';

import Page from './page';

const page = new Page();
const key = Buffer.from(process.env.KEY_OPENCAGE, 'base64').toString('ascii');

// eslint-disable-next-line no-unused-expressions
fixture`Opencage`.page`../pages/providers.html`;

test('Searching', async (t) => {
  await t
    .typeText(page.provider, PROVIDERS.OPENCAGE)
    .expect(page.provider.value)
    .eql(PROVIDERS.OPENCAGE)
    .typeText(page.key, key)
    .expect(page.key.value)
    .eql(key)
    .typeText(page.input, 'New York')
    .expect(page.input.value)
    .eql('New York')
    .pressKey('enter')
    // .debug()
    .expect(page.result.childElementCount)
    .gt(1);
});
