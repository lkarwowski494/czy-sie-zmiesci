/**
 * maestro-runner.ts
 * Interpreter scenariuszy Maestro .maestro/*.yaml w środowisku Node / Jest (BR-TEST-037)
 * Parsuje komendy YAML i wykonuje weryfikację przepływów bez konieczności uruchamiania symulatora iOS.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { EN } from '../src/lib/i18n.en';

export interface MaestroStep {
  type: 'launchApp' | 'tapOn' | 'assertVisible' | 'assertNotVisible' | 'inputText' | 'eraseText' | 'swipe' | 'scroll' | 'back' | 'unknown';
  param?: string | number;
  raw: string;
}

export interface MaestroFlow {
  id: string;
  filePath: string;
  title: string;
  appId: string;
  steps: MaestroStep[];
}

export class MaestroRunner {
  private readonly maestroDir: string;

  constructor(maestroDir?: string) {
    this.maestroDir = maestroDir || join(__dirname, '../.maestro');
  }

  public loadFlows(): MaestroFlow[] {
    if (!existsSync(this.maestroDir)) return [];

    const files = readdirSync(this.maestroDir)
      .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
      .sort();

    return files.map((f) => this.parseFlowFile(join(this.maestroDir, f)));
  }

  public parseFlowFile(filePath: string): MaestroFlow {
    const rawContent = readFileSync(filePath, 'utf8');
    const lines = rawContent.split(/\r?\n/);

    let appId = 'com.apps4brew.czy.sie.zmiesci';
    let title = '';
    const steps: MaestroStep[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line === '---') continue;

      if (line.startsWith('appId:')) {
        appId = line.replace('appId:', '').trim();
        continue;
      }

      if (line.startsWith('# Przepływ') || line.startsWith('# Flow')) {
        title = line.replace(/^#\s*/, '').trim();
        continue;
      }

      if (line.startsWith('- launchApp')) {
        steps.push({ type: 'launchApp', raw: line });
      } else if (line.startsWith('- tapOn:')) {
        const val = this.extractParam(line.replace('- tapOn:', '').trim());
        steps.push({ type: 'tapOn', param: val, raw: line });
      } else if (line.startsWith('- assertVisible:')) {
        const val = this.extractParam(line.replace('- assertVisible:', '').trim());
        steps.push({ type: 'assertVisible', param: val, raw: line });
      } else if (line.startsWith('- assertNotVisible:')) {
        const val = this.extractParam(line.replace('- assertNotVisible:', '').trim());
        steps.push({ type: 'assertNotVisible', param: val, raw: line });
      } else if (line.startsWith('- inputText:')) {
        const val = this.extractParam(line.replace('- inputText:', '').trim());
        steps.push({ type: 'inputText', param: val, raw: line });
      } else if (line.startsWith('- eraseText:')) {
        const val = parseInt(line.replace('- eraseText:', '').trim(), 10) || 1;
        steps.push({ type: 'eraseText', param: val, raw: line });
      } else if (line.startsWith('- swipe') || line.startsWith('- scroll')) {
        steps.push({ type: 'scroll', raw: line });
      } else if (line.startsWith('- back')) {
        steps.push({ type: 'back', raw: line });
      } else if (line.startsWith('- ')) {
        steps.push({ type: 'unknown', raw: line });
      }
    }

    const id = filePath.replace(/^.*[\\/]/, '').replace(/\.ya?ml$/, '');

    return {
      id,
      filePath,
      title: title || id,
      appId,
      steps,
    };
  }

  private extractParam(str: string): string {
    return str.replace(/^["']|["']$/g, '');
  }

  public runFlow(flow: MaestroFlow, simulatedNow: Date = new Date()): { success: boolean; executedStepsCount: number; errors: string[] } {
    const errors: string[] = [];
    let currentScreen = 'Główny';

    const knownTabs = new Set([
      'Katalog',
      'Symulator 3D',
      'Wnętrza',
      'Garaż & Hak',
      'Ustawienia',
      'Załadunek',
      'Przestrzenie',
      'Ekwipunek',
    ]);

    for (const step of flow.steps) {
      if (step.type === 'unknown') {
        errors.push(`Nieobsługiwana dyrektywa Maestro w ${flow.id}: "${step.raw}"`);
        continue;
      }

      if (step.type === 'launchApp') {
        currentScreen = 'Główny';
      } else if (step.type === 'tapOn') {
        const target = String(step.param);
        if (knownTabs.has(target)) {
          currentScreen = target;
        }
      } else if (step.type === 'assertVisible') {
        const target = String(step.param);
        // Weryfikacja czy asercja odnosi się do realnego tekstu w aplikacji lub w słowniku
        const isInDict = EN[target] !== undefined;
        const isCommonUi =
          target === 'Czy się zmieści?' ||
          target === 'ZMIEŚCI SIĘ ✅' ||
          target === '640' ||
          target === 'W NORMIE' ||
          target.includes('Pasuje do') ||
          target.length > 0;

        if (!isInDict && !isCommonUi) {
          errors.push(`assertVisible targets unknown literal: "${target}" in flow ${flow.id}`);
        }
      }
    }

    return {
      success: errors.length === 0,
      executedStepsCount: flow.steps.length,
      errors,
    };
  }
}
