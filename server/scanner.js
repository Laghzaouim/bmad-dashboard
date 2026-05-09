import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const CODE_PATH = process.env.CODE_PATH || '/Users/mo/code';
const HOST_CODE_PATH = process.env.HOST_CODE_PATH || CODE_PATH;

function toHostPath(p) {
  return p.replace(CODE_PATH, HOST_CODE_PATH);
}

function parseEpicTitles(rawContent) {
  const titles = {};
  const re = /# (?:─+\s*)?Epic (\d+)[:.]\s+(.+?)(?:\s*─+)?\s*$/gm;
  let match;
  while ((match = re.exec(rawContent)) !== null) {
    const title = match[2].replace(/─+\s*$/, '').trim();
    if (title) titles[`epic-${match[1]}`] = title;
  }
  return titles;
}

function slugToTitle(slug) {
  return slug
    .replace(/^\d+-\d+-/, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

function parseEpics(developmentStatus, epicTitles) {
  const map = {};
  for (const [key, rawValue] of Object.entries(developmentStatus)) {
    const value = String(rawValue).trim();
    if (key.includes('retrospective')) continue;

    if (/^epic-\d+$/.test(key)) {
      if (!map[key]) map[key] = { id: key, title: '', status: value, stories: [] };
      else map[key].status = value;
      map[key].title = epicTitles[key] || `Epic ${key.replace('epic-', '')}`;
      continue;
    }

    const m = key.match(/^(\d+)-(\d+)/);
    if (m) {
      const epicKey = `epic-${m[1]}`;
      if (!map[epicKey]) {
        map[epicKey] = {
          id: epicKey,
          title: epicTitles[epicKey] || `Epic ${m[1]}`,
          status: 'backlog',
          stories: [],
        };
      }
      map[epicKey].stories.push({ id: key, title: slugToTitle(key), status: value });
    }
  }
  return Object.values(map);
}

function overallStatus(epics) {
  if (epics.some(e => e.status === 'in-progress')) return 'in-progress';
  if (epics.length > 0 && epics.every(e => e.status === 'done')) return 'done';
  return 'backlog';
}

export function scanProjects() {
  let files;
  try {
    const out = execSync(
      `find "${CODE_PATH}" -maxdepth 5 -name "sprint-status.yaml"` +
        ` -not -path "*/node_modules/*"` +
        ` -not -path "*/.git/*"` +
        ` -not -path "*/.ralph/*"` +
        ` -not -path "*/target/*"`,
      { encoding: 'utf8', timeout: 10000 }
    );
    files = out.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }

  // Deduplicate: prefer _bmad-output path over others for same project dir
  const seen = new Map();
  for (const f of files) {
    const projectDir = path.resolve(f, '../../..');
    if (!seen.has(projectDir) || f.includes('_bmad-output')) {
      seen.set(projectDir, f);
    }
  }

  return [...seen.values()].map(filePath => {
    try {
      const raw = readFileSync(filePath, 'utf8');
      const data = yaml.load(raw);
      const epicTitles = parseEpicTitles(raw);
      const artifactsDir = path.dirname(filePath);
      const epics = parseEpics(data.development_status || {}, epicTitles);

      return {
        name: data.project || path.basename(path.resolve(filePath, '../../..')),
        lastUpdated: formatDate(data.last_updated || data.generated),
        overallStatus: overallStatus(epics),
        // _filePath is the internal path used for file watching (uses CODE_PATH)
        _filePath: filePath,
        // These use HOST_CODE_PATH so clipboard pastes work in the terminal
        sprintStatusPath: toHostPath(filePath),
        artifactsDir: toHostPath(artifactsDir),
        epics,
      };
    } catch {
      return null;
    }
  }).filter(Boolean).sort((a, b) => {
    const order = { 'in-progress': 0, backlog: 1, done: 2 };
    return (order[a.overallStatus] ?? 3) - (order[b.overallStatus] ?? 3);
  });
}
