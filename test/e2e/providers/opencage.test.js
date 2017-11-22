import '../../env';
import { PROVIDERS } from '../../../konstants';
import Page from './page';

const page = new Page();

fixture `Opencage`.page `../pages/providers.html`;

test('Searching', async t => {
  await t
    .typeText(page.provider, PROVIDERS.OPENCAGE)
    .expect(page.provider.value).eql(PROVIDERS.OPENCAGE)
    .typeText(page.key, process.env.KEY_OPENCAGE)
    .expect(page.key.value).eql(process.env.KEY_OPENCAGE)
    .typeText(page.input, 'New York')
    .expect(page.input.value).eql('New York')
    .pressKey('enter')
    // .debug()
    .expect(page.result.childElementCount).gt(1);
});
