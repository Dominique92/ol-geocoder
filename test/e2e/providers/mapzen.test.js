import '../../env';
import { PROVIDERS } from '../../../konstants';
import Page from './page';

const page = new Page();

fixture `Mapzen`.page `../pages/providers.html`;

test('Searching', async t => {
  await t
    .typeText(page.provider, PROVIDERS.MAPQUEST)
    .expect(page.provider.value).eql(PROVIDERS.MAPQUEST)
    .typeText(page.key, process.env.KEY_MAPQUEST)
    .expect(page.key.value).eql(process.env.KEY_MAPQUEST)
    .typeText(page.input, 'New York')
    .expect(page.input.value).eql('New York')
    .pressKey('enter')
    // .debug()
    .expect(page.result.childElementCount).gt(1);
});
