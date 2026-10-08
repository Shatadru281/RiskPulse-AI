# RiskPulse AI recording and upload guide

The supplied submission guidelines require a **10-minute screen recording** and a **YouTube Unlisted** viewing link in README. A webcam is not specified as a requirement. Use your own narration and show the working application, not only the slides.

## Prepare the demonstration

1. Install dependencies before recording. Show the README commands and start the app; do not spend the video waiting for downloads.
2. Keep one server on port 3000. If it is already running, show its command and Ready output. For a new session, run `npm run dev` from the project folder.
3. Open http://127.0.0.1:3000. Choose **Offline demo** and click **Refresh feeds**.
4. Rehearse the geopolitical, credit and positive-earnings buttons. Replay refreshes fixture timestamps and recomputes scores.
5. Keep the deck, README, architecture, dashboard and a second terminal ready. Use the second terminal for `npm test`.
6. Copy the fictional Ardent Bank input from [DEMO_SCRIPT.md](DEMO_SCRIPT.md) before you begin.
7. Close unrelated windows and notifications. Make browser and terminal text readable at 1080p. Keep the script on another device or an uncaptured display.

## Record your screen and microphone

OBS Studio can capture a display or application window and microphone. Its Auto-Configuration Wizard helps choose settings; the Audio Mixer shows input levels. See the [official OBS quick-start guide](https://obsproject.com/kb/quick-start-guide).

Use a screen capture that includes the application, terminal and slides as you switch between them. A practical target is 1920 × 1080 at 30 fps if your computer records smoothly. Select your microphone, make a short test recording, and listen back before the full take. These are recording recommendations, not extra hackathon requirements.

Follow the ten-minute timeline. Speak slowly over financial formulas, keep clicks deliberate and let results appear. Avoid background music that competes with your explanation. If the take runs short, spend more time explaining actual evidence and positions; do not pad it with a blank screen.

Save the recording outside the repository, for example as `RiskPulse_AI_Shatadru_Adhikary_Demo.mp4` in your Videos folder. Git ignores common video extensions.

## Review the recording

- The video is approximately 10 minutes and contains the complete demonstration.
- Your voice is audible throughout.
- Code, KPI values, charts and terminal results are readable.
- The startup command and running app are shown.
- The geopolitical case goes from text to scores to automatic stress and position losses.
- Positive earnings visibly remains below the automatic threshold.
- Tests shown are from a completed run, and all claims match the screen.

## Upload and verify

Upload to your YouTube channel and set **Visibility → Unlisted**. Anyone with an unlisted viewing link can watch without a Google account; this is different from a private video. See [YouTube's official visibility guidance](https://support.google.com/youtube/answer/157177?hl=en).

Suggested title:

```text
RiskPulse AI | Shatadru Adhikary | S&P Global & Crisil Campus Hackathon 2026
```

Suggested description:

```text
Individual submission by Shatadru Adhikary, Vellore Institute of Technology.

RiskPulse AI converts financial news and public discussion into explainable risk signals and demonstrates Module B portfolio stress testing.

Code and datasets:
https://github.com/Shatadru281/vit-shatadru-adhikary-hackathon

Presentation:
https://github.com/Shatadru281/vit-shatadru-adhikary-hackathon/blob/main/docs/presentation.pdf

All demonstration events and portfolio positions are synthetic. Scenario shocks are illustrative, uncalibrated assumptions. This is an educational prototype, not investment advice.

AI assistance was used for implementation, debugging, tests and documentation.
```

Wait until playback is available, then open the final viewing link in a signed-out/private window. Check the beginning, middle and end. Replace the pending **Demo Video Link** in README with that URL and push the update. Use a video viewing URL, not a channel, Studio-edit, local-file, private, Google Drive or OneDrive link.

Submit the repository URL, video URL and slide deck through the official form. The guideline file contains neither an actual deadline nor the form URL; use the organizers' communication. Retain the recording and keep the app ready for any live jury session.

## Pronunciation and explanations

- **NLP:** “N L P,” natural language processing.
- **PD:** probability of default.
- **LGD:** loss given default.
- **EAD:** exposure at default.
- **DV01:** “D V zero one,” dollar change for a one-basis-point rate movement.
- **100 basis points:** one percentage point.
- **Duration:** first-order sensitivity of a bond price to yield changes.
- **Beta:** equity sensitivity to a broad market move.
- **Incremental loan loss:** stressed expected credit loss minus baseline expected credit loss.
