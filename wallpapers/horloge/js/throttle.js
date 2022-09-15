const throttle = (callback, delay) => {
  let last;
  let timer;
  // eslint-disable-next-line func-names
  return function () {
    const context = this;
    const newDelay = delay;
    const now = +new Date();
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    if (last && now < last + newDelay) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = now;
        callback.apply(context, args);
      }, newDelay);
    } else {
      last = now;
      callback.apply(context, args);
    }
  };
}
