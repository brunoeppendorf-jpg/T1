# Heftweise – Server für die Sportschule Halle

Kleiner selbst gehosteter Server für die Schulsachen-Börse. Kein Cloud-Dienst, keine
Abhängigkeit von Claude – läuft komplett auf eurem eigenen Server.

## Was du brauchst

- Einen Server/Rechner mit **Node.js** (Version 18 oder neuer). Prüfen mit:
  ```
  node -v
  ```
  Falls nicht installiert: https://nodejs.org (LTS-Version reicht).

## Installation

1. Diesen Ordner (`heftweise-server`) auf den Server kopieren.
2. Im Ordner ausführen:
   ```
   npm install
   ```
   (installiert nur `express`, das einzige benötigte Paket)
3. Server starten:
   ```
   npm start
   ```
4. Im Browser öffnen: `http://<Server-Adresse>:3000`

Die Daten (Profile + Inserate) landen in `data/state.json` und bleiben beim Neustart
des Servers erhalten.

## Dauerhaft laufen lassen

Node-Prozesse laufen nicht automatisch weiter, wenn du das Terminal schließt. Zwei
gängige Optionen:

**Mit PM2** (einfach, empfohlen für den Einstieg):
```
npm install -g pm2
pm2 start server.js --name heftweise
pm2 save
pm2 startup
```

**Mit systemd** (falls ihr einen Linux-Server verwaltet): eine kleine `.service`-Datei
einrichten, die `node server.js` im Hintergrund startet und bei einem Serverneustart
automatisch mitstartet. Sag Bescheid, falls du dabei Hilfe brauchst.

## Erreichbarkeit im Schulnetz / von außen

- **Nur im Schulnetz erreichbar:** reicht meist schon die interne IP-Adresse des
  Servers + Port 3000, z. B. `http://192.168.1.50:3000`.
- **Über eine echte Domain / von außen erreichbar:** dafür würde man normalerweise
  einen Reverse Proxy (z. B. nginx) davorsetzen, der Port 3000 nach außen z. B. als
  `https://schulsachen.eure-schule.de` bereitstellt. Das ist ein zusätzlicher
  Konfigurationsschritt auf dem Server – sag Bescheid, falls ihr das wollt, dann bauen
  wir das mit ein.

## Wichtig zu wissen

- **Passwörter werden gehasht gespeichert** (bcrypt, 12 Salt-Runden). Im Klartext
  landet ein Passwort nie in `data/state.json` – auch nicht kurzzeitig. Der
  Passwort-Hash verlässt den Server außerdem nie: die API liefert an den Browser
  immer nur Name, Klasse und Nutzername zurück.
- **Login wird bei jedem Besuch erneut abgefragt** (nur der zuletzt verwendete
  Nutzername wird zum Vorausfüllen gemerkt, nicht das Passwort). Für ein "eingeloggt
  bleiben" bräuchte man ein echtes Session-/Token-System – bewusst weggelassen, um die
  Sache einfach und nachvollziehbar zu halten.
- **Keine Verschlüsselung/HTTPS von Haus aus.** Läuft die Seite nur im Schulnetz, ist
  das Restrisiko überschaubar. Soll sie von außen erreichbar sein, gehört unbedingt
  ein Reverse Proxy mit HTTPS (z. B. via Let's Encrypt) davor – sonst reisen auch
  gehashte Passwörter unverschlüsselt durchs Netz.
- **Einfache Speicherung.** Alle Daten liegen in einer einzelnen JSON-Datei – für eine
  Schule/Klasse ausreichend, aber kein Ersatz für eine echte Datenbank bei sehr vielen
  gleichzeitigen Nutzer:innen.
- **Datenschutz-Check vor dem Live-Betrieb:** Da hier Namen, Klassen und Passwörter von
  (teils minderjährigen) Schüler:innen verarbeitet werden, würde ich das vor dem
  echten Einsatz kurz mit der Schulleitung / dem oder der Datenschutzbeauftragten der
  Schule absprechen – insbesondere Informationspflichten (Datenschutzerklärung) und ob
  bei jüngeren Schüler:innen eine Einwilligung der Erziehungsberechtigten nötig ist.
  Das kann dieses Projekt technisch nicht für euch entscheiden.
