// Heftweise – Server fuer die Schulsachen-Boerse der Sportschule Halle
// Nutzer-Passwoerter werden ausschliesslich gehasht gespeichert (bcrypt).
// Passwort-Hashes verlassen den Server nie - der Client bekommt nur Name/Klasse/Nutzername.

const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data', 'state.json');
const PORT = process.env.PORT || 3000;
const SALT_ROUNDS = 12;

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function readState() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      listings: Array.isArray(parsed.listings) ? parsed.listings : [],
    };
  } catch (e) {
    return { users: [], listings: [] };
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

// Gibt einen Nutzer nach aussen weiter, OHNE den Passwort-Hash
function toPublicUser(u) {
  return { username: u.username, name: u.name, klasse: u.klasse };
}

// ---------- Registrierung ----------
app.post('/api/register', async (req, res) => {
  const { username, password, name, klasse } = req.body || {};
  if (!username || !password || !name || !klasse) {
    return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen haben.' });
  }
  const state = readState();
  if (state.users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Dieser Nutzername ist schon vergeben.' });
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = { username, passwordHash, name, klasse };
  state.users.push(newUser);
  writeState(state);
  res.json({ user: toPublicUser(newUser) });
});

// ---------- Login ----------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Bitte Nutzername und Passwort angeben.' });
  }
  const state = readState();
  const found = state.users.find(u => u.username === username);
  if (!found) {
    return res.status(401).json({ error: 'Nutzername oder Passwort ist falsch.' });
  }
  const match = await bcrypt.compare(password, found.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Nutzername oder Passwort ist falsch.' });
  }
  res.json({ user: toPublicUser(found) });
});

// ---------- Inserate ----------
app.get('/api/listings', (req, res) => {
  res.json({ listings: readState().listings });
});

app.post('/api/listings', (req, res) => {
  const { listings } = req.body || {};
  if (!Array.isArray(listings)) {
    return res.status(400).json({ error: 'invalid body' });
  }
  const state = readState();
  state.listings = listings;
  writeState(state);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Heftweise läuft auf http://localhost:${PORT}`);
});
