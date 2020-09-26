import { basename } from 'path';

import { watch } from 'rollup';

import { fileSize } from './helpers.js';
import { getInputOptions, getOutputOptions, createOnWarn } from './options.js';

export default function buildAndWatch(subscriber, spinners) {
  return new Promise((resolve, reject) => {
    const inputOptions = getInputOptions(false);
    const outputOptions = getOutputOptions(false);

    inputOptions.onwarn = createOnWarn(subscriber);

    const watcher = watch({
      ...inputOptions,
      output: [outputOptions],
      watch: { clearScreen: false },
    });

    watcher.on('event', (event) => {
      switch (event.code) {
        case 'START':
          spinners.building.start();

          break;
        case 'BUNDLE_END': {
          spinners.building.isSpinning && spinners.building.succeed();

          const input = basename(event.input.toString());
          const bundle = event.output.toString();

          let message = `Compiled ${input} -> ${basename(bundle)} in ${
            event.duration / 1000
          } seconds!`;

          subscriber.next({ status: 'info', message });

          message = `At: ${new Date()}`;
          subscriber.next({ status: 'info', message });

          message = `Bundle size: ${fileSize(bundle)}`;
          subscriber.next({ status: 'info', message });

          break;
        }
        case 'ERROR':
          reject(event.error.message);

          break;
      }
    });
  });
}
