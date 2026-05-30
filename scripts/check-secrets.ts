#!/usr/bin/env bun
/**
 * check-secrets.ts — guard против утечки секретов (ЭТАП 5.1).
 *
 * Падает (exit 1), если ЯВНЫЙ секрет найден там, откуда он может утечь:
 *   • .git/config         — токен в URL ремоута / Authorization-заголовок;
 *   • git-tracked файлы   — README, CI, package.json, скрипты, случайно
 *                           закоммиченный .env и т.п.;
 *   • логи/отчёты         — reports/**, *.log.
 *
 * Ищет: GitHub PAT (ghp_/github_pat_/gho_/ghu_/ghs_/ghr_), Yandex OAuth (y0_),
 * креды в URL (user:pass@host), basic-auth в git config, а также литеральные
 * присваивания секрет-подобным ключам (CF_TOKEN/…_TOKEN/…_SECRET/…_KEY/OAUTH).
 *
 * НИКОГДА не печатает сам секрет — только путь, строку и ТИП находки.
 * НЕ сканирует .env.local/.env/.env.production (локальные gitignored-хранилища),
 * но ОТДЕЛЬНО флагует их, если они попали под git-контроль.
 *
 *   bun scripts/check-secrets.ts        # exit 1 при находке, 0 если чисто
 *   npm run check:secrets
 */
import { Glob } from 'bun';

interface Finding { file: string; line: number; type: string; }

// Однозначные «формы» токенов — печатаем только тип, не значение.
const SHAPES: { re: RegExp; type: string }[] = [
  { re: /github_pat_[A-Za-z0-9_]{20,}/, type: 'GitHub fine-grained PAT (github_pat_)' },
  { re: /\bghp_[A-Za-z0-9]{20,}/, type: 'GitHub classic PAT (ghp_)' },
  { re: /\bgh[ousr]_[A-Za-z0-9]{20,}/, type: 'GitHub token (gho_/ghu_/ghs_/ghr_)' },
  { re: /\by0_[A-Za-z0-9_-]{20,}/, type: 'Yandex OAuth token (y0_)' },
];
// Креды внутри URL: scheme://user:pass@host  ИЛИ  scheme://<длинный-токен>@host.
// Намеренно НЕ ловим ssh-форму git@github.com (нет «://» и нет пароля).
const URL_CRED = /[a-zA-Z][a-zA-Z0-9+.\-]*:\/\/(?:[^/\s:@]+:[^/\s@]+|gh[opsur]_[A-Za-z0-9]{10,}|github_pat_[A-Za-z0-9_]{10,}|[A-Za-z0-9]{20,})@[^/\s]+/;
// basic-auth в git config (так actions/checkout кладёт токен в CI; локально быть не должно)
const GIT_AUTH = /extraheader|[Aa]uthorization:\s*[Bb]asic\s+\S+/;
// Литеральное присваивание секрет-подобному ключу реальным значением.
const SECRET_KEY = /\b([A-Z][A-Z0-9_]*(?:TOKEN|SECRET|OAUTH|API[_-]?KEY|APIKEY|PASSWORD|PRIVATE_KEY|ACCESS_KEY))\b\s*[:=]\s*(['"]?)([^'"\s#]+)\2/;
// Значение-«ссылка на код/env», а не секрет — игнорируем.
const CODE_REF = /^(process\.|import\.|Bun\.|Deno\.|os\.|globalThis|env\.|config\.|secrets\.|vars\.|\$\{|\$\(|<|\{\{)/;
const PLACEHOLDER = /^(your[_-]?|example|placeholder|changeme|change_me|xxx+|dummy|sample|fake|redacted|todo|none|null|undefined|true|false|\*+)$/i;

const SKIP_EXT = new Set(['png','jpg','jpeg','gif','webp','ico','woff','woff2','ttf','otf','eot','pdf','zip','gz','br','mp4','mp3','webm','wasm','lock']);
const SKIP_DIR = /(^|\/)(node_modules|dist|\.git\/(objects|lfs)|\.astro)(\/|$)/;
const ENV_FILE = /(^|\/)\.env(\.|$)/;

function scan(file: string, text: string, out: Finding[]) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (!ln || ln.length > 4000) continue;
    for (const { re, type } of SHAPES) if (re.test(ln)) out.push({ file, line: i + 1, type });
    if (URL_CRED.test(ln) && !/^\s*[#;]/.test(ln)) out.push({ file, line: i + 1, type: 'credential embedded in URL' });
    const am = ln.match(SECRET_KEY);
    if (am) {
      const val = am[3];
      if (val.length >= 16 && !CODE_REF.test(val) && !PLACEHOLDER.test(val) && /[A-Za-z0-9_\-]{16,}/.test(val) && !/[(){}]/.test(val)) {
        out.push({ file, line: i + 1, type: `literal secret assigned to ${am[1]}` });
      }
    }
  }
}

async function readSafe(p: string): Promise<string | null> {
  try {
    const f = Bun.file(p);
    if (!(await f.exists())) return null;
    if (f.size > 2_000_000) return null; // не сканируем огромные файлы
    return await f.text();
  } catch { return null; }
}

async function main() {
  const root = process.cwd();
  const findings: Finding[] = [];
  const seen = new Set<string>();
  const scanned: string[] = [];

  async function consider(rel: string, label: string) {
    if (seen.has(rel)) return;
    if (SKIP_DIR.test(rel)) return;
    const ext = (rel.split('.').pop() || '').toLowerCase();
    if (SKIP_EXT.has(ext)) return;
    seen.add(rel);
    const txt = await readSafe(rel);
    if (txt == null) return;
    scanned.push(rel);
    scan(rel, txt, findings);
  }

  // 1) .git/config — токен в URL / basic-auth.
  // В CI (GitHub Actions) actions/checkout кладёт ВРЕМЕННЫЙ basic-auth в .git/config
  // рунера — это не утечка, а эфемерная авторизация. Поэтому в CI этот блок пропускаем
  // (committed-секреты ловятся ниже по tracked-файлам и логам).
  const isCI = process.env.GITHUB_ACTIONS === 'true' || !!process.env.CI;
  if (!isCI) {
    const cfg = await readSafe('.git/config');
    if (cfg != null) {
      scanned.push('.git/config');
      const lines = cfg.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (URL_CRED.test(lines[i])) findings.push({ file: '.git/config', line: i + 1, type: 'token in remote URL' });
        if (GIT_AUTH.test(lines[i])) findings.push({ file: '.git/config', line: i + 1, type: 'auth header / extraheader in git config' });
        for (const { re, type } of SHAPES) if (re.test(lines[i])) findings.push({ file: '.git/config', line: i + 1, type });
      }
    }
  }

  // 2) git-tracked файлы
  let tracked: string[] = [];
  try { tracked = (await Bun.$`git ls-files`.quiet().text()).split('\n').filter(Boolean); } catch {}
  for (const rel of tracked) {
    if (ENV_FILE.test(rel)) { findings.push({ file: rel, line: 0, type: 'env-файл с секретами под git-контролем (должен быть в .gitignore)' }); continue; }
    await consider(rel, 'tracked');
  }

  // 3) логи / отчёты
  for (const pattern of ['reports/**/*', '*.log', 'scripts/**/*.log', 'logs/**/*']) {
    try {
      for await (const rel of new Glob(pattern).scan({ dot: false })) {
        if (ENV_FILE.test(rel)) continue;
        await consider(rel, 'log');
      }
    } catch {}
  }

  // вывод — только путь:строка + тип, без значений
  console.log(`🔒 check:secrets — просканировано источников: ${scanned.length} (.git/config + tracked + логи)`);
  if (findings.length) {
    console.error(`\n❌ НАЙДЕНЫ потенциальные секреты в открытом виде (${findings.length}):`);
    for (const f of findings) console.error(`  ${f.file}${f.line ? ':' + f.line : ''}  →  ${f.type}`);
    console.error('\nУбери секрет из этого места. Локальные секреты держи в .env.local / keychain / env, не в репозитории и не в URL.');
    process.exit(1);
  }
  console.log('✅ Секретов в открытом виде не найдено (.git/config, tracked-файлы, логи — чисто).');
}

main().catch((e) => { console.error('FATAL check-secrets:', e?.message || e); process.exit(2); });
