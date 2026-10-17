import { ResilientTimer } from '../timer';

describe('ResilientTimer — Timery Odporne na Uśpienie w Tle (NFR-PERF-004 / RD-ENG-06)', () => {
  it('odlicza czas na podstawie różnicy bezwzględnych znaczników czasu', () => {
    const t0 = 1700000000000;
    const timer = new ResilientTimer(180); // 3 minuty

    timer.start(t0);
    expect(timer.getRemainingSec(t0)).toBe(180);

    // Symulacja uśpienia i wybudzenia telefonu po 135 sekundach BEZ ticków setInterval
    const t1 = t0 + 135000;
    expect(timer.getRemainingSec(t1)).toBe(45);

    // Wybudzenie po 200 sekundach (przekroczenie czasu)
    const t2 = t0 + 200000;
    expect(timer.getRemainingSec(t2)).toBe(0);

    timer.destroy();
  });

  it('obsługuje pauzę i wznowienie bez gubienia czasu', () => {
    const t0 = 1700000000000;
    const timer = new ResilientTimer(100);

    timer.start(t0);
    // Po 20s pauzujemy:
    timer.pause(t0 + 20000);
    expect(timer.getRemainingSec()).toBe(80);

    // Telefon śpi 5 minut (300s):
    const tResume = t0 + 320000;
    timer.start(tResume);
    // Nadal powinno być 80 sekund:
    expect(timer.getRemainingSec(tResume)).toBe(80);

    // Po 10s od wznowienia:
    expect(timer.getRemainingSec(tResume + 10000)).toBe(70);

    timer.destroy();
  });

  it('powiadamia subskrybentów o aktualizacji czasu', () => {
    const timer = new ResilientTimer(60);
    const cb = jest.fn();
    const unsub = timer.subscribe(cb);

    expect(cb).toHaveBeenCalledWith(60);

    timer.start();
    expect(cb).toHaveBeenCalled();

    unsub();
    timer.destroy();
  });
});
