const { PROP_SEED } = require('./tests/prop-seed');

// Log deterministycznego ziarna (BR-TEST-008)
if (process.env.NODE_ENV === 'test' && !process.env.PROP_SEED_LOGGED) {
  process.env.PROP_SEED_LOGGED = '1';
  console.log(`[prop-seed] PROP_SEED=${PROP_SEED} (odtwórz: PROP_SEED=${PROP_SEED} npm test)`);
}

// Dozwolona biała lista ostrzeżeń (jeśli znane i bezpieczne)
const WARN_ALLOWLIST = [
  /expo-sqlite: memory fallback/,
];

const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    const msg = args.map((a) => (typeof a === 'string' ? a : (a && a.stack) || JSON.stringify(a))).join(' ');
    // Zawsze rzucaj błąd przy console.error lub ostrzeżeniu act() (BR-TEST-018)
    originalError(...args);
    throw new Error(`[BR-TEST-018] Nieoczekiwany console.error w teście:\n${msg}`);
  };

  console.warn = (...args) => {
    const msg = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    const isAllowed = WARN_ALLOWLIST.some((re) => re.test(msg));
    if (!isAllowed) {
      originalWarn(...args);
      throw new Error(`[BR-TEST-018] Nieoczekiwany console.warn w teście:\n${msg}`);
    }
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

afterEach(() => {
  try {
    jest.clearAllTimers();
  } catch {
    // ignoruj jeśli timery nie były mockowane
  }
});
