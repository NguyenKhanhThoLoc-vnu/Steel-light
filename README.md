# Steel Light

**I Am Oppy** is an interactive story about NASA's Mars rover **Opportunity (Oppy)**, from the lab in 2003 to the last dust storm in 2018. Oppy tells the story of the journey and of the equipment left behind on Mars: the lander, the backshell and parachute, the heat shield, and finally Oppy itself, still resting in Perseverance Valley. Click to move the story forward, tap objects to explore, and play two small mini-games along the way. The story is narrated in English, with English and Vietnamese subtitles.

## NASA Space Apps Challenge

| | |
|---|---|
| Challenge | Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars |
| Team | Pi-Oneers |
| Project | Steel Light |

This is a participant project, not an official NASA product.

## Built with

React 19 and Vite 8. Narration uses the browser's Web Speech API, and music and sound effects are generated with the Web Audio API, so there are no audio files and no API keys.

## Requirements

- [Node.js](https://nodejs.org/) 20.19+ or 22.12+ (npm comes with it)
- Microsoft Edge (recommended, it has the most natural voices) or Chrome

## Getting started

```bash
git clone https://github.com/<your-username>/oppy-tale.git
cd oppy-tale
npm install
npm run dev
```

Then open http://localhost:5173 (the browser usually opens by itself) and click **Wake Oppy up**.

> On Windows, if PowerShell says "running scripts is disabled on this system", use `npm.cmd install` and `npm.cmd run dev`, or run the commands in Command Prompt.

## Project structure

```
oppy-tale/
├─ public/images/   NASA photos
└─ src/
   ├─ data/         the story script (story.js) and photo credits (photos.js)
   ├─ components/   stage, subtitles, mini-games, first-person scenes
   ├─ art/          the rover, objects and backgrounds, drawn as SVG
   ├─ audio/        generated music and sound effects
   └─ hooks/        narration, rover driving, auto-play timers
```

To change the story text, edit `src/data/story.js`.

## AI disclosure

This project was built with the help of Claude (Anthropic), an AI assistant.

- **Code:** the React/Vite source code was written with Claude, then reviewed and tested by our team.
- **Text:** the English narration and Vietnamese subtitles were drafted with Claude from our team's notes and checked against NASA sources.
- **Images:** the cartoon illustrations (the rover, scenes and objects) are SVG drawings produced by AI-written code, and are labeled "Illustrations: AI-generated" on screen. The real photos are unedited NASA images.
- **Audio:** the background music and sound effects are synthesized in the browser by AI-written code (Web Audio API). The narration uses the browser's built-in text-to-speech voices.

No NASA logos, flags or mission insignia are used in any AI-generated content.

## Credits

Facts come from [NASA's Spirit & Opportunity mission pages](https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/). Photos are courtesy of NASA/JPL-Caltech and partners (Cornell, USGS, ASU, Univ. of Arizona, MSSS, TAMU, KSC), credited with each image.
