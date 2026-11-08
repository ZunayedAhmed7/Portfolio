# Zunayed Ahmed

Personal portfolio built with HTML, CSS, and vanilla JavaScript. No package
installation, backend, or build step is required.

## Local preview

From the repository root:

```powershell
python -m http.server 5501
```

Open <http://localhost:5501>. The shared VS Code Live Server setting uses the
same port. Python is only a local preview server; the hosted site is static.

## GitHub Pages

Publish the repository root (`/(root)`) from your chosen publishing branch in
**Settings > Pages > Deploy from a branch**. The entry point is `index.html`,
and `.nojekyll` disables Jekyll processing. No custom Actions workflow is needed
for branch-based publishing.

`CNAME` preserves the existing `zunayed7.com` domain. Keep the corresponding
custom-domain and DNS settings configured for that domain. Asset URLs are
relative, so the site also works under a GitHub Pages repository subdirectory.

See GitHub's [publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Files

- `index.html`: page content, navigation, project cards, and About boarding pass.
- `css/styles.css`: layout, typography, responsive rules, and split-flap faces.
- `css/boarding-pass.css`: About ticket and portrait crop.
- `js/main.js`: project details and keyboard focus.
- `js/split-flap.js`: mechanical display, cycling, joke timing, and motion controls.
- `js/engineering-gallery.js`: engineering studies and their transitions.
- `assets/`: current artwork, portrait, logos, flags, fonts, favicon, and resume.
- `licenses/`: bundled font licenses.

All resume links download `assets/Zunayed_Resume_SWE.pdf` directly. The original
portrait bytes are preserved in `assets/zunayed-portrait.png`; CSS controls the
crop. The About quote strip is reserved for a future favourite quote.

## Interactions

The split-flap display cycles through the name, DAC to YYZ with flag faces, and
a debugging joke. The joke holds NO / ERRORS for three seconds while the corner
flap jams, then slowly corrects to ONE / ERROR over 1.5 seconds. The faulty
corner remains visible during the six-second punchline. The other states hold
for four seconds. Cycling pauses on hover, focus, or when offscreen; the Pause
control also freezes the fault. Reduced motion uses static faces.

The engineering collection contains Concorde, SR-71, the Apollo Guidance
Computer, and Falcon 9. Buttons, arrow keys, Home/End, and touch swipes change
studies. Partwise and Purchase Order Automation open inline project details.

## Credits

Keep the source credits and font licenses with the site:

- [Engineering artwork](assets/engineering/README.md)
- [Company logos](assets/companies/README.md)
- [Route flags](assets/flags/README.md)
- [Font licenses](licenses/)
