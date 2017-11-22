import '../../env';
import { PROVIDERS } from '../../../konstants';
import Page from './page';

const page = new Page();

fixture `Photon`.page `../pages/providers.html`;

test('Searching', async t => {
  await t
    .typeText(page.provider, PROVIDERS.PHOTON)
    .expect(page.provider.value).eql(PROVIDERS.PHOTON)
    .typeText(page.input, 'New York')
    .expect(page.input.value).eql('New York')
    .pressKey('enter')
    // .debug()
    .expect(page.result.childElementCount).gt(1);
});
