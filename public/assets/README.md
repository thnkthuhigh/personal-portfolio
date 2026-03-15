# Case Media

- Folder `assets/cases/` currently contains visual placeholder SVGs for all project galleries.
- Replace each SVG with your real screenshot (same file name) to update UI instantly.

## Recommended image spec

- Format: `.webp` or `.jpg`
- Ratio: `16:10`
- Width: `1600px` or above
- Keep text readable at small sizes

## Video setup

In `src/data/portfolioData.ts` each project supports detail fields that can be rendered in React routes:

- `videoEmbed`: YouTube embed URL (example: `https://www.youtube.com/embed/xxxxx`)
- `videoFile`: local MP4 path (example: `assets/videos/ops-dashboard-demo.mp4`)
- `videoPoster`: optional poster image path

When `videoFile` is set, it is preferred over `videoEmbed`.
When both are empty, the NDA/private placeholder is shown.
