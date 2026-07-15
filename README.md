# Pro Bibliography Manager

![License](https://img.shields.io/badge/License-MIT-yellow.svg)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21370030.svg)](https://doi.org/10.5281/zenodo.21370030)

A lightweight, single-file HTML5/JavaScript application for managing academic bibliographies. It runs entirely in the browser with zero dependencies, requiring no backend server or installation.

**⚠️ Project Status: Experimental / Untested**
Please note that this is a personal utility and has **not** been rigorously tested. 
* The BibTeX parser relies on basic regular expressions and will likely fail on complex, nested, or non-standard LaTeX formatting. 
* Data is saved exclusively to the browser's `localStorage`. If the browser cache is cleared, then the data will be deleted. **Always use the "Export JSON" feature to back up the library.**
* Expect bugs, particularly with edge cases in citation formatting.

## Features

* **Smart Search:** Fetches basic citation data (DOI, title, authors, year) using the public CrossRef API.
* **BibTeX / Batch Import:** Parses standard BibTeX entries (`@article`, `@book`, etc.) from raw text or uploaded `.bib` files. Includes a basic fallback for raw text lines.
* **Manual Entry:** Form fields for Journal Articles, Books, Websites, and Conference Proceedings.
* **Custom Citation Styles:** A template engine that allows you to build custom citation formats using standard tags (e.g., `{authors} ({year}). {title}.`).
* **Local Persistence:** Saves data between sessions using browser local storage.
* **Import/Export:** Save the library as a JSON file for backup or transferring between devices.

## Usage

This is a single-file application. No build process or installation is required.

**Option 1: Run Locally (Simplest)**
1. Download the `index.html` file.
2. Double-click to open it in the web browser (Firefox, Chrome, Edge).
*Note: If using Safari or have strict browser privacy settings, the "Save" feature (`localStorage`) might be blocked for local files. In that case, use Option 2.*

**Option 2: Local Web Server**
If the browser restricts local file execution, one can run it via a basic local server. 
From the terminal in the file's directory, run: `python -m http.server 8000` and visit `http://localhost:8000`.

## Limitations & Known Issues

* **Author Parsing:** The logic for parsing authors from CrossRef and BibTeX is simplified. It may not correctly format multi-part surnames or institutional authors.
* **Citation Parsing:** The logic for parsing numbered citations is dependent on the use of the hyphen character '-'. The use of and en-dash or em-dash is not recognized, so these should be converted to hyphens before processing the text in this application.
* **API Limits:** The CrossRef API integration uses unauthenticated requests, which are subject to rate limiting if used heavily.
* **Formatting:** Standard formats (APA, IEEE) are hardcoded approximations and may not strictly adhere to the latest official manual guidelines. 

## License

MIT License

## Credits

* **Documentation & Code Review:** AI Assistant (Gemini)
