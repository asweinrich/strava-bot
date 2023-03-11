const cache = {
  cache: {},
  get(key) {
    return this.cache[key];
  },
  set(key, val) {
    this.cache[key] = val;
  },
};

export default cache;
