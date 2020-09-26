import { writeFileSync } from 'fs';
import { basename } from 'path';

import maxmin from 'maxmin';
import { rollup } from 'rollup';

import { prettyTimeFromBigint } from './helpers.js';
import { getInputOptions, getOutputOptions, createOnWarn } from './options.js';

export default function createBundle({ env: environment, minify, spinners, subscriber }) {
  return new Promise((resolve, reject) => {
    const inputOptions = getInputOptions(environment, minify);
    const outputOptions = getOutputOptions();
    const start = process.hrtime.bigint();

    inputOptions.onwarn = createOnWarn(subscriber);
    spinners.building.start();

    rollup(inputOptions)
      .then((bundle) => bundle.generate(outputOptions))
      .then(({ output: [{ code, message }] }) => {
        let subscriberMessage;

        const end = process.hrtime.bigint();
        const size = maxmin(code, code, true);
        const inputFile = basename(inputOptions.input);
        const outputFile = basename(outputOptions.file);
        const duration = prettyTimeFromBigint(start, end);

        writeFileSync(outputOptions.file, code);

        spinners.building.isSpinning && spinners.building.succeed();
        subscriberMessage = `Compiled ${inputFile} -> ${outputFile} in ${duration}!`;
        subscriber.next({ status: 'info', message: subscriberMessage });

        subscriberMessage = `Bundle size: ${size.slice(size.indexOf(' → ') + 3)}`;
        subscriber.next({ status: 'info', message: subscriberMessage });

        resolve();
      })
      .catch((error) => reject(error.message));
  });
}
