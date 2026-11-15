# I Am Oppy: an interactive story about the Opportunity rover

An interactive storytelling website **in English**, told in the first person by NASA's Mars rover **Opportunity (Oppy)**, featuring:

- **Interaction instead of scrolling**: click the arrow next to Oppy → Oppy drives over → the next line begins. Tap objects (the rocket, the "blueberries", the meteorite, the gypsum vein…) to explore them.
- **Rocket launch countdown** (chapter 2): 3 → 2 → 1 appears big on screen with narration, the rocket shakes on the pad, and it only lifts off when the count ends.
- **Asteroid-dodging mini-game** (chapter 2): steer the spacecraft with the mouse, a finger or the ↑ ↓ keys for 20 seconds, with a star rating and a Skip button.
- **Landing mini-game** (chapter 3): open the parachute at the right height (the green zone around 9 km), then fire the airbags and retro-rockets just above the ground. Too early or too late means a "CRUNCH!" and another try; only a perfect landing (or Skip) moves the story on. During the game, the subtitles shrink into a small chat bubble in the bottom-left corner, so the Martian ground stays visible.
- **Movie-like scenes**: letterbox bars, a slow camera zoom on Oppy, camera shake in storms. Scenes include:
  - **a first-person view as Oppy's eyes open for the first time** (chapter 1): a dark screen, eyelids flutter open, the blurry image sharpens, the lab lights switch on one by one, and the engineers wave at the camera: "Hello, Oppy!";
  - homesickness while looking back at a shrinking Earth;
  - the first night on Mars, with Earth as a tiny star;
  - getting stuck in the sand at Purgatory Dune;
  - trembling through the dust storms of 2007 and 2018;
  - **a first-person view as the battery runs out** (chapter 10): looking through Oppy's camera eyes in the dark storm, battery at 1%, eyes slowly closing with the famous line "My battery is low and it's getting dark". An on-screen note explains that this line is a poetic summary by reporter Jacob Margolis, not a real message.
- **A storyteller for the ending**: from the long sleep (the last part of chapter 10) to the end, a narrator tells the story in the third person, in a different voice, while Oppy sleeps. The subtitle box then shows **NARRATOR** instead of OPPY, and radio messages from Earth full of love and longing ("We miss you, Oppy.", "Please call home."…) float around the sleeping rover.
- **Oppy is never still**: while talking, Oppy moves to match the mood, and the antenna blinks and sends out waves.
  - Happy: jumps, waves, wiggles the wheels.
  - Curious: tilts the head, glances around, spins the antenna dish.
  - Sad: sighs.
  - Scared: trembles.
  - Sleepy: yawns and nods off.
- **Lively backgrounds**:
  - Lab: 6 engineers walking both ways (carrying clipboards, crates and tablets), one engineer typing, a heartbeat monitor, LED lights.
  - Launch pad: searchlights sweeping the sky.
  - Space: a passing comet.
  - Mars: drifting clouds, a distant dust devil, floating dust.
  - Night: Phobos crossing the sky, shooting stars.
- **A true timeline**: the chapters run in order from 2003 to 2019, and each discovery appears at its real date.
- **Craters seen from the ground**:
  - Chapter 5: Endurance is **a round crater seen at an angle**, with layered rock walls and dunes on its floor. Oppy drives down into it (the near rim hides the wheels), then climbs back out.
  - Chapter 7: the craters are drawn as a cutaway of the soil layers. Oppy stands on the cliffs of Victoria and gazes at the rim of Endeavour, 22 km away.
  - A small map in the corner shows where Oppy is.
  - These two chapters use a wide shot, so Oppy is drawn a little smaller.
- **Realistic driving**: accelerate → cruise → brake. The wheels turn to match the distance, the body bounces and pitches with inertia, and the three wheels bounce out of step like a rocker-bogie suspension, leaving dust and tracks on Mars. Short moves back up; long ones turn around.
- **Generated music and sound effects** (made in the browser with the Web Audio API, no audio files, so no copyright issues):
  - Music plays **only at about 20 key moments**, and the rest is silent so it never gets tiring: waking up, the launch, homesickness, the games, the landing, finding water, the meteorite, the storms, Spirit, Endeavour, the marathon, lost contact, the final moments, the record and the farewell. Each cue fades out after about 35 seconds, stays quiet, and dips whenever someone is speaking.
  - Each mood has its own melody: wonder (bells), triumph (a cheerful fanfare), sad (slow piano), tense (a heartbeat), lullaby (a music box)…
  - Important effects (the motor, the "bee-beep" when Oppy sets off, the "beep beep" on arrival, the rocket…) are about 20 dB louder than the music.
  - Effects: countdown, rocket launch, the motor while Oppy drives, "beep beep" when reaching a rock, reversing beeps, the robot arm, parachute pop, airbags, retro-rockets, bounces, crashes, storm wind, signals to Earth, radio calls, and power-up / power-down in the first-person scenes.
- **Automatic English narration** (the browser's built-in Web Speech API: free, no key needed), with the word being read highlighted. The storyteller uses a different voice from Oppy.
- **Bilingual English–Vietnamese subtitles** (switch between EN+VI / EN only / VI only / off).
- **21 real NASA photos** shown as polaroids; click one to enlarge it with its caption and credit.
- 11 chapters and 63 story beats; works on desktop and mobile.

---

## 1. Requirements

| What you need | Version | Check |
|---|---|---|
| Node.js | 20.19+ or 22.12+ | `node -v` |
| npm | comes with Node | `npm -v` |
| Browser | **Microsoft Edge** (recommended, it has the most natural voices) or Chrome | |

## 2. First run

Open a terminal (PowerShell, Command Prompt or Git Bash) in the project folder:

```bash
cd oppy-tale
npm install        # install the dependencies (only needed once)
npm run dev        # start the development server
```

The browser opens **http://localhost:5173** by itself. If it doesn't, open that link yourself.
When you edit the code, the page updates automatically. Stop the server with `Ctrl + C`.

> **PowerShell says "running scripts is disabled on this system"?**
> Use `npm.cmd install` and `npm.cmd run dev`, or run the commands in Command Prompt / Git Bash.

### Running it again (restarting the server)

From the second time on, you don't need `npm install`:

```bash
cd oppy-tale
npm run dev
```

To restart a server that is already running: press `Ctrl + C` in that terminal, then run `npm run dev` again.

| Situation | What to do |
|---|---|
| You edited code in `src/` | No restart needed: the page updates itself. If you don't see the change, press **F5** (or **Ctrl + F5** for a full reload) |
| You edited `vite.config.js` or `index.html`, or just installed a new package | `Ctrl + C`, then `npm run dev` |
| "Port 5173 is in use" | An old server is still running in another terminal: close that terminal, or open the new link Vite prints (e.g. :5174) |
| You want to start fresh like a new visitor (clear the saved voice and subtitle settings) | Open the page, press **F12** → **Console** tab → type `localStorage.clear()` → Enter → **F5** |

## 3. How to watch and control

1. Click **"Wake Oppy up"**. Browsers only allow speech after the user clicks a button.
2. Move on with the **orange arrow next to Oppy**, by **clicking Oppy**, with the **Next** button, or with the **→ / Space** keys.
3. When an object glows with **"👆 Tap!"**, you have to tap it for the story to continue.
4. Click the **polaroid photo** in the corner to see the real NASA photo.

The top bar:

| Button | What it does |
|---|---|
| 🔊 / 🔇 | Turns the narration on/off |
| ♪ | Turns the background music on/off |
| CC | Changes the subtitles: EN+VI → EN → VI → Off |
| ⏵ Auto | Plays the whole story by itself: taps the objects and moves on automatically. Mini-games: if nobody presses Start, the game is skipped after 9 seconds; a game in progress is **never interrupted**, and the story only moves on after it ends |
| ⚙ | Chooses the voice and reading speed; turns music and sound effects on/off and sets their volume |
| ☰ (click the chapter name) | Jumps to any chapter |

Keyboard shortcuts: `→` / `Space` / `Enter` = next · `←` = back · `Esc` = close a window.

## 4. Folder structure

```
oppy-tale/
├─ index.html
├─ package.json
├─ vite.config.js
├─ public/
│  ├─ favicon.svg
│  └─ images/
│     ├─ nasa/          ← 21 real NASA photos (resized)
│     └─ reference/     ← 5 style reference images
└─ src/
   ├─ main.jsx
   ├─ App.jsx           ← story flow, auto-play, keyboard shortcuts
   ├─ styles.css        ← all the styling and animation
   ├─ data/
   │  ├─ story.js       ← THE SCRIPT: 11 chapters, EN + VI lines, music per beat, messages from Earth
   │  └─ photos.js      ← NASA photo list, captions, credits
   ├─ art/              ← SVG drawings (drawn in code so they can move)
   │  ├─ Rover.jsx      ← Oppy: 14 moods, idle moves, turning wheels, robot arm
   │  ├─ Objects.jsx    ← rocket, meteorite, "blueberries", gypsum vein…
   │  └─ Scenes.jsx     ← backgrounds: JPL lab, launch pad, space, Mars (day, night, storm)…
   ├─ audio/
   │  └─ sound.js       ← background music + sound effects (Web Audio API, no audio files)
   ├─ components/
   │  ├─ Stage.jsx      ← the stage: movie camera, Oppy, objects, arrow button, polaroid photo
   │  ├─ Panels.jsx     ← top bar, subtitle box, chapter menu, photo viewer
   │  ├─ CruiseGame.jsx ← asteroid-dodging mini-game (chapter 2)
   │  ├─ LandingGame.jsx ← parachute landing mini-game (chapter 3)
   │  ├─ PovView.jsx    ← first-person views: waking up in the lab (chapter 1), eyes closing as the battery dies (chapter 10)
   │  └─ Screens.jsx    ← title and end screens
   └─ hooks/
      ├─ useNarrator.js ← automatic English narration (Oppy's voice and the storyteller's voice)
      ├─ useRoverDrive.js ← Oppy's driving motion (speed, wheels, dust, tracks)
      └─ useAutoTimer.js  ← timers that auto-skip / auto-continue the mini-games in Auto mode
```

## 5. Data and image sources

- Facts: [NASA: Spirit & Opportunity](https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/) and its [Science Highlights](https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-highlights/), plus the `images.nasa.gov` photo pages.
- Images: NASA/JPL-Caltech, Cornell, USGS, ASU, Univ. of Arizona, MSSS, TAMU, KSC. NASA images are generally not copyrighted, but they still need a credit (given with each photo). The site does **not** use the NASA logo.

**A few corrections made for accuracy**, compared with the original notes:

| Original note | In the story | Why |
|---|---|---|
| "7 times heavier than Sojourner" | "much bigger than Sojourner" | Sojourner weighed about 10.6 kg and Opportunity 185 kg (about 17 times as much) |
| "volcanic craters" | "impact craters" | Endurance, Victoria and Endeavour were made by meteorite impacts, not volcanoes |
| landed "20 days" after Spirit | "three weeks" | Spirit landed on January 3, 2004 and Opportunity on January 24, 2004 (US time): 21 days |
| (added) | Perseverance broke the driving record in October 2026 | According to NASA's mission page |
| (added) | The line "My battery is low and it's getting dark" | Used in the battery scene, with a clear note that it is a paraphrase by reporter Jacob Margolis (KPCC), not a real message |
| "In 2010 Spirit lost contact" | Spirit was stuck in sand from 2009, stopped answering in 2010, and never woke up despite more than a year of calls | Spirit got stuck at "Troy" in May 2009; its last signal came on March 22, 2010; NASA stopped calling in May 2011 |
| (added) | The final wake-up song, "I'll Be Seeing You" | On February 12, 2019, after more than 1,000 recovery commands with no answer, the team sent one last series of commands with Billie Holiday's "I'll Be Seeing You". NASA declared the mission complete the next day, February 13, 2019 |
