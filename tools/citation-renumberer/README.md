# Pro Citation Renumbering Tool

A lightweight, browser-based utility designed to solve the problem of editing manuscripts with hardcoded, numbered citations.

When paragraphs are rearranged or new sources are added to a paper, numbered citations (like `[1, 2-4]`) become out of order. This tool temporarily converts numbered citations into author-year tags to allow for unrestricted editing, and then seamlessly converts them back into perfectly ordered numbers.

**⚠️ Project Status: Experimental / Untested**
Please note that this is a personal utility and has not been rigorously tested. 

## Features
* **Two-Way Conversion:** Translates bracketed numbers into readable tags (e.g., `[Smith 2020]`) and back again.
* **Smart Range Handling:** Automatically expands ranges (e.g., `[1-3]`) to tags, and condenses sequential tags back into ranges.
* **Automatic Re-sorting:** Rebuilds the reference list from scratch based on the order of appearance in the newly edited text.
* **Zero Dependencies:** A single HTML file with vanilla JavaScript and CSS. Runs entirely locally in the browser with no server calls.

## How to Use It
1. **Paste** the manuscript text and the numbered reference list into the provided text areas.
2. Click **Convert Numbers to Tags**. All numbers in the text will become short-form tags based on the reference list.
3. **Edit** the manuscript. Move paragraphs around, delete citations, or type in new tags.
4. Click **Convert Tags to Numbers**. The tool will reassign numbers chronologically (1, 2, 3...) based on the new order of appearance and generate a sorted reference list to match.
