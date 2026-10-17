// Deterministyczne ziarno dla testów własnościowych (BR-TEST-008)
const envSeed = process.env.PROP_SEED || process.env.MATRIX_SEED;

let seedValue;
if (envSeed === 'random') {
  seedValue = Math.floor(Math.random() * 0x7fffffff);
} else if (envSeed && /^\d+$/.test(envSeed)) {
  seedValue = parseInt(envSeed, 10);
} else {
  seedValue = 0x5eed1234; // Stałe domyślne ziarno dla determinizmu w CI
}

module.exports = {
  PROP_SEED: seedValue,
  MATRIX_RUNS: parseInt(process.env.MATRIX_RUNS || '200', 10),
};
