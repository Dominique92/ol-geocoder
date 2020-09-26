import Ora from 'ora';
import rxjs from 'rxjs';
import colors from 'ansi-colors';

import createBundle from './bundle.js';
import buildAndWatch from './watch.js';

const needToWatch = process.argv.includes('watch');

const coloured = (string, status) => {
  return {
    succeed: colors.green(string),
    info: colors.blue(string),
    warn: colors.yellow(string),
    error: colors.red(string),
  }[status];
};
const spinners = {
  deps: new Ora(coloured('Bundling Dependencies', 'succeed')),
  building: new Ora(coloured('Build is on the way', 'succeed')),
};

const { Observable } = rxjs;
const build = new Observable((subscriber) => {
  if (needToWatch) {
    buildAndWatch(subscriber, spinners).catch((error) => {
      spinners.building.fail(coloured(error, 'error'));
      subscriber.error(error);
    });
  } else {
    createBundle({ minify: false, spinners, subscriber })
      .then(() => createBundle({ minify: true, spinners, subscriber }))
      .then(() => subscriber.complete())
      .catch((error) => subscriber.error(error));
  }
});

build.subscribe({
  next(data) {
    const { status, message } = data;

    if (spinners.building.isSpinning && status === 'warn') {
      spinners.building.warn();
    }

    const spinner = new Ora();

    spinner[status](coloured(message, status));
  },

  error(error) {
    spinners.building.fail(error);

    console.trace(error);
  },

  complete() {
    new Ora('App bundle built!').succeed();
  },
});
