// Cruza las conjugaciones del Quiz Rápido de Français contra una tabla de
// paradigmas escrita aparte de los ítems. Los ítems `fill` de la forma
//   enunciado: "Conjuga «manger» en presente."   antes: "Nous"   respuesta: "mangeons"
// se verifican contra PARADIGMAS['manger'][persona], donde la persona sale del
// primer sujeto de `antes` (je/j', tu, il/elle/on o un sustantivo singular,
// nous, vous, ils/elles o un sustantivo plural). Sirve de red de seguridad
// para el examen de conjugación: una errata en una forma, como «mangons» en
// vez de «mangeons», pasaría el verificador de estructura pero no este.
// Los ítems que no siguen ese formato (los viejos de loisirs, por ejemplo) no se tocan. Correr: `node scripts/verificar-frances-conjugaciones.mjs`
import { readFileSync } from 'node:fs'

const items = JSON.parse(readFileSync(new URL('../src/data/frances/fr_quiz_rapido.json', import.meta.url), 'utf-8'))

// Personas: 0 je, 1 tu, 2 il/elle/on, 3 nous, 4 vous, 5 ils/elles
const er = (s, nous) => [s + 'e', s + 'es', s + 'e', nous ?? s + 'ons', s + 'ez', s + 'ent']
const ir2 = (s) => [s + 'is', s + 'is', s + 'it', s + 'issons', s + 'issez', s + 'issent']

const PARADIGMAS = {
  // primer grupo
  parler: er('parl'), aimer: er('aim'), jouer: er('jou'), habiter: er('habit'), travailler: er('travaill'),
  danser: er('dans'), chanter: er('chant'), écouter: er('écout'), regarder: er('regard'), adorer: er('ador'),
  détester: er('détest'), préparer: er('prépar'), étudier: er('étudi'),
  manger: er('mang', 'mangeons'), voyager: er('voyag', 'voyageons'), nager: er('nag', 'nageons'), partager: er('partag', 'partageons'),
  commencer: er('commenc', 'commençons'), avancer: er('avanc', 'avançons'), lancer: er('lanc', 'lançons'),
  payer: ['paie', 'paies', 'paie', 'payons', 'payez', 'paient'],
  envoyer: ['envoie', 'envoies', 'envoie', 'envoyons', 'envoyez', 'envoient'],
  essayer: ['essaie', 'essaies', 'essaie', 'essayons', 'essayez', 'essaient'],
  nettoyer: ['nettoie', 'nettoies', 'nettoie', 'nettoyons', 'nettoyez', 'nettoient'],
  employer: ['emploie', 'emploies', 'emploie', 'employons', 'employez', 'emploient'],
  appuyer: ['appuie', 'appuies', 'appuie', 'appuyons', 'appuyez', 'appuient'],
  préférer: ['préfère', 'préfères', 'préfère', 'préférons', 'préférez', 'préfèrent'],
  espérer: ['espère', 'espères', 'espère', 'espérons', 'espérez', 'espèrent'],
  répéter: ['répète', 'répètes', 'répète', 'répétons', 'répétez', 'répètent'],
  acheter: ['achète', 'achètes', 'achète', 'achetons', 'achetez', 'achètent'],
  lever: ['lève', 'lèves', 'lève', 'levons', 'levez', 'lèvent'],
  promener: ['promène', 'promènes', 'promène', 'promenons', 'promenez', 'promènent'],
  mener: ['mène', 'mènes', 'mène', 'menons', 'menez', 'mènent'],
  geler: ['gèle', 'gèles', 'gèle', 'gelons', 'gelez', 'gèlent'],
  appeler: ['appelle', 'appelles', 'appelle', 'appelons', 'appelez', 'appellent'],
  jeter: ['jette', 'jettes', 'jette', 'jetons', 'jetez', 'jettent'],
  // segundo grupo
  finir: ir2('fin'), choisir: ir2('chois'), réussir: ir2('réuss'), grandir: ir2('grand'), atterrir: ir2('atterr'),
  accomplir: ir2('accompl'), remplir: ir2('rempl'), réfléchir: ir2('réfléch'), obéir: ir2('obé'),
  // tercer grupo, familias A a G de la hoja
  dormir: ['dors', 'dors', 'dort', 'dormons', 'dormez', 'dorment'],
  sortir: ['sors', 'sors', 'sort', 'sortons', 'sortez', 'sortent'],
  partir: ['pars', 'pars', 'part', 'partons', 'partez', 'partent'],
  servir: ['sers', 'sers', 'sert', 'servons', 'servez', 'servent'],
  sentir: ['sens', 'sens', 'sent', 'sentons', 'sentez', 'sentent'],
  lire: ['lis', 'lis', 'lit', 'lisons', 'lisez', 'lisent'],
  écrire: ['écris', 'écris', 'écrit', 'écrivons', 'écrivez', 'écrivent'],
  conduire: ['conduis', 'conduis', 'conduit', 'conduisons', 'conduisez', 'conduisent'],
  vivre: ['vis', 'vis', 'vit', 'vivons', 'vivez', 'vivent'],
  suivre: ['suis', 'suis', 'suit', 'suivons', 'suivez', 'suivent'],
  attendre: ['attends', 'attends', 'attend', 'attendons', 'attendez', 'attendent'],
  répondre: ['réponds', 'réponds', 'répond', 'répondons', 'répondez', 'répondent'],
  entendre: ['entends', 'entends', 'entend', 'entendons', 'entendez', 'entendent'],
  perdre: ['perds', 'perds', 'perd', 'perdons', 'perdez', 'perdent'],
  vendre: ['vends', 'vends', 'vend', 'vendons', 'vendez', 'vendent'],
  prendre: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'],
  apprendre: ['apprends', 'apprends', 'apprend', 'apprenons', 'apprenez', 'apprennent'],
  comprendre: ['comprends', 'comprends', 'comprend', 'comprenons', 'comprenez', 'comprennent'],
  venir: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'],
  revenir: ['reviens', 'reviens', 'revient', 'revenons', 'revenez', 'reviennent'],
  tenir: ['tiens', 'tiens', 'tient', 'tenons', 'tenez', 'tiennent'],
  mettre: ['mets', 'mets', 'met', 'mettons', 'mettez', 'mettent'],
  permettre: ['permets', 'permets', 'permet', 'permettons', 'permettez', 'permettent'],
  connaître: ['connais', 'connais', 'connaît', 'connaissons', 'connaissez', 'connaissent'],
  reconnaître: ['reconnais', 'reconnais', 'reconnaît', 'reconnaissons', 'reconnaissez', 'reconnaissent'],
  // los súper irregulares
  être: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
  avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
  aller: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
  faire: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
  pouvoir: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'],
  vouloir: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'],
  dire: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'],
  // fuera de la hoja
  ouvrir: ['ouvre', 'ouvres', 'ouvre', 'ouvrons', 'ouvrez', 'ouvrent'],
  offrir: ['offre', 'offres', 'offre', 'offrons', 'offrez', 'offrent'],
  couvrir: ['couvre', 'couvres', 'couvre', 'couvrons', 'couvrez', 'couvrent'],
  peindre: ['peins', 'peins', 'peint', 'peignons', 'peignez', 'peignent'],
  craindre: ['crains', 'crains', 'craint', 'craignons', 'craignez', 'craignent'],
  voir: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'],
  croire: ['crois', 'crois', 'croit', 'croyons', 'croyez', 'croient'],
  savoir: ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'],
  devoir: ['dois', 'dois', 'doit', 'devons', 'devez', 'doivent'],
  recevoir: ['reçois', 'reçois', 'reçoit', 'recevons', 'recevez', 'reçoivent'],
  boire: ['bois', 'bois', 'boit', 'buvons', 'buvez', 'boivent'],
  courir: ['cours', 'cours', 'court', 'courons', 'courez', 'courent'],
  // pronominales (solo la forma verbal; el pronombre va en `antes`)
  'se lever': ['lève', 'lèves', 'lève', 'levons', 'levez', 'lèvent'],
  "s'appeler": ['appelle', 'appelles', 'appelle', 'appelons', 'appelez', 'appellent'],
  'se promener': ['promène', 'promènes', 'promène', 'promenons', 'promenez', 'promènent'],
  'se réveiller': ['réveille', 'réveilles', 'réveille', 'réveillons', 'réveillez', 'réveillent'],
  'se coucher': ['couche', 'couches', 'couche', 'couchons', 'couchez', 'couchent'],
  'se servir': ['sers', 'sers', 'sert', 'servons', 'servez', 'servent'],
  'se promettre': ['promets', 'promets', 'promet', 'promettons', 'promettez', 'promettent'],
  "s'instruire": ['instruis', 'instruis', 'instruit', 'instruisons', 'instruisez', 'instruisent'],
  'se souvenir': ['souviens', 'souviens', 'souvient', 'souvenons', 'souvenez', 'souviennent'],
}

// ---------------------------------------------------------------------------
// Deducción de la persona a partir de `antes`
// ---------------------------------------------------------------------------
const PRONOMBRES = { je: 0, "j'": 0, tu: 1, il: 2, elle: 2, on: 2, nous: 3, vous: 4, ils: 5, elles: 5 }

function personaDe(antes) {
  const t = antes.trim().toLowerCase()
  if (/paul et marc|marie et léa|les enfants/.test(t)) return 5
  if (/\b(marie|paul|le garçon|la cliente)\b/.test(t)) return 2
  // el último pronombre sujeto de la cadena ("Demain, je me" da je)
  let persona = null
  for (const tok of t.split(/[\s,]+/)) {
    if (tok.startsWith("j'")) persona = 0
    else if (tok in PRONOMBRES) persona = PRONOMBRES[tok]
  }
  return persona
}

let errores = 0
const cuenta = { presente: 0 }
const sinParadigma = []
const fail = (msg) => {
  console.log('FAIL', msg)
  errores++
}

for (const it of items) {
  if (it.formato !== 'fill') continue

  // 1. presente
  let m = it.enunciado.match(/^Conjuga «([^»]+)» en presente\./)
  if (m) {
    const inf = m[1]
    const persona = personaDe(it.antes)
    if (persona === null) {
      fail(`${it.id}: no puedo deducir la persona de «${it.antes}»`)
      continue
    }
    const par = PARADIGMAS[inf]
    if (!par) {
      sinParadigma.push(`${it.id} (${inf})`)
      continue
    }
    cuenta.presente++
    // La respuesta principal debe ser la forma del paradigma. Las alternativas
    // (payer: paie/paye, essayer: essaie/essaye) son variantes legítimas extra.
    if (it.respuesta !== par[persona]) fail(`${it.id}: ${inf}, persona ${persona}. El paradigma dice «${par[persona]}» y el ítem dice «${it.respuesta}»`)
    continue
  }
}

console.log(`${cuenta.presente} presentes cruzados (${Object.keys(PARADIGMAS).length} paradigmas)`)
if (sinParadigma.length) {
  console.log(`FAIL ítems con verbo sin tabla en este script: ${sinParadigma.join(', ')}`)
  errores += sinParadigma.length
}
console.log(errores === 0 ? '\nOK — 0 errores' : `\n${errores} error(es)`)
process.exit(errores === 0 ? 0 : 1)
