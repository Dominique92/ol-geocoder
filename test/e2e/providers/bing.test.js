import '../../env';
import { PROVIDERS } from '../../../konstants';
import Page from './page';

const page = new Page();

fixture `Bing`.page `../pages/providers.html`;

test('Searching', async t => {
  await t
    .typeText(page.provider, PROVIDERS.BING)
    .expect(page.provider.value).eql(PROVIDERS.BING)
    .typeText(page.key, process.env.KEY_BING)
    .expect(page.key.value).eql(process.env.KEY_BING)
    .typeText(page.input, 'New York')
    .expect(page.input.value).eql('New York')
    .pressKey('enter')
    // .debug()
    .expect(page.result.childElementCount).gt(1);
});
