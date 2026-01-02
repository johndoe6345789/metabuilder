export const packageSeed = {
  metadata: require('./metadata.json'),
  components: require('./components.json'),
  scripts: {
    init: require('./scripts/init.lua'),
    fetch_runs: require('./scripts/fetch_runs.lua'),
    analyze: require('./scripts/analyze.lua'),
    filter: require('./scripts/filter.lua'),
    status: require('./scripts/status.lua'),
  },
}

export default packageSeed
