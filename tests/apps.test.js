/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Bibliography Manager End-to-End Tests', () => {
  beforeEach(() => {
    // Reset DOM and reload the page before each test
    const filePath = path.resolve(__dirname, '../index.html');
    const html = fs.readFileSync(filePath, 'utf8');
    document.documentElement.innerHTML = html;

    // Evaluate script
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    if (!scriptMatch) throw new Error('No script tag found in index.html');
    window.eval(scriptMatch[1]);

    // Mock localStorage
    const store = {};
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = String(value); },
      clear: () => { for (let k in store) delete store[k]; }
    };

    // Reset items to ensure test isolation by using clearLibrary
    window.confirm = () => true;
    if (typeof window.clearLibrary === 'function') {
      window.clearLibrary();
    }

    if (typeof window.onload === 'function') {
      window.onload();
    }
  });

  test('Test Case 1.1: BibTeX Parsing and APA Formatting', () => {
    const bibtex = `@article{smith2020,
  author = {Smith, John and Doe, Jane},
  title = {A Study of Stars},
  journal = {Journal of Astronomy},
  year = {2020},
  volume = {5},
  pages = {10-20},
  doi = {10.1234/ast.2020}
}`;

    // 1. Navigate to Batch / BibTeX tab (optional but good to mimic)
    window.switchTab('batch');

    // 2. Paste input data into text area
    document.getElementById('batchInput').value = bibtex;

    // 3. Click button Process Text
    window.parseBatch();

    // 4. Under Output Format, select APA 7th
    document.getElementById('formatSelect').value = 'apa';
    window.handleFormatChange();

    // Verify Output
    const outputDiv = document.getElementById('libraryOutput');
    const items = outputDiv.querySelectorAll('.bib-item');
    expect(items).toHaveLength(1);

    const text = items[0].querySelector('.result-text').textContent.trim().replace(/\s+/g, ' ');
    expect(text).toBe('Smith, John; Doe, Jane (2020). A Study of Stars. Journal of Astronomy. doi:10.1234/ast.2020');
  });

  test('Test Case 1.2: Style Switching to IEEE', () => {
    const bibtex = `@article{smith2020,
  author = {Smith, John and Doe, Jane},
  title = {A Study of Stars},
  journal = {Journal of Astronomy},
  year = {2020},
  volume = {5},
  pages = {10-20},
  doi = {10.1234/ast.2020}
}`;

    document.getElementById('batchInput').value = bibtex;
    window.parseBatch();

    // Under Output Format, select IEEE
    document.getElementById('formatSelect').value = 'ieee';
    window.handleFormatChange();

    const outputDiv = document.getElementById('libraryOutput');
    const items = outputDiv.querySelectorAll('.bib-item');
    expect(items).toHaveLength(1);

    const text = items[0].querySelector('.result-text').textContent.trim().replace(/\s+/g, ' ');
    expect(text).toBe('[1] Smith, John; Doe, Jane, "A Study of Stars," Journal of Astronomy, 2020.');
  });

  test('Test Case 1.3: Batch Parsing - Raw Text Fallback and Long Author Lists', () => {
    const rawInput = `Rae, J.W.; Borgeaud, S.; Cai, T.; Millican, K.; Hoffmann, J.; Song, F.; Aslanides, J.; Henderson, S.; Ring, R.; Young, S.; et al. Scaling Language Models: Methods, Analysis & Insights from Training Gopher. arXiv 2021, arXiv:2112.11446. [Google Scholar]`;

    window.switchTab('batch');
    document.getElementById('batchInput').value = rawInput;
    window.parseBatch();

    document.getElementById('formatSelect').value = 'apa';
    window.handleFormatChange();

    const outputDiv = document.getElementById('libraryOutput');
    const items = outputDiv.querySelectorAll('.bib-item');
    expect(items).toHaveLength(1);

    const text = items[0].querySelector('.result-text').textContent.trim().replace(/\s+/g, ' ');
    expect(text).toBe('Rae, J (2021). Parsed (Please Edit). Rae, J.W.; Borgeaud, S.; Cai, T.; Millican, K.; Hoffmann, J.; Song, F.; Aslanides, J.; Henderson, S.; Ring, R.; Young, S.; et al. Scaling Language Models: Methods, Analysis & Insights from Training Gopher. arXiv 2021, arXiv:2112.11446. [Google Scholar].');
  });
});

describe('Citation Renumberer End-to-End Tests', () => {
  beforeEach(() => {
    const filePath = path.resolve(__dirname, '../tools/citation-renumberer/index.html');
    const html = fs.readFileSync(filePath, 'utf8');
    document.documentElement.innerHTML = html;

    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    if (!scriptMatch) throw new Error('No script tag found in citation-renumberer/index.html');
    window.eval(scriptMatch[1]);
  });

  test('Test Case 2.1: Convert Numbers to Tags (Range Expansion)', () => {
    const bodyInput = `The sky is blue [1]. Water is wet [2-3].`;
    const refInput = `1. Smith, J. (2020). The sky.
2. Doe, A. (2019). Water properties.
3. Johnson, B. (2021). Liquids.`;

    document.getElementById('docBody').value = bodyInput;
    document.getElementById('refList').value = refInput;

    window.convertToTags();

    expect(document.getElementById('docBody').value).toBe(`The sky is blue [Smith 2020]. Water is wet [Doe 2019; Johnson 2021].`);

    // Normalize newlines and spaces for comparison
    const expectedRefs = `[Smith 2020] Smith, J. (2020). The sky.

[Doe 2019] Doe, A. (2019). Water properties.

[Johnson 2021] Johnson, B. (2021). Liquids.`;
    expect(document.getElementById('refList').value.replace(/\r\n/g, '\n')).toBe(expectedRefs);
  });

  test('Test Case 2.2: Convert Tags to Numbers (Reordering and Condensing)', () => {
    const bodyInput = `New observation: [Doe 2019; Johnson 2021; Smith 2020].`;
    const refInput = `[Smith 2020] Smith, J. (2020). The sky.
[Doe 2019] Doe, A. (2019). Water properties.
[Johnson 2021] Johnson, B. (2021). Liquids.`;

    document.getElementById('docBody').value = bodyInput;
    document.getElementById('refList').value = refInput;

    window.convertToNumbers();

    expect(document.getElementById('docBody').value).toBe(`New observation: [1-3].`);

    const expectedRefs = `1. Doe, A. (2019). Water properties.

2. Johnson, B. (2021). Liquids.

3. Smith, J. (2020). The sky.`;
    expect(document.getElementById('refList').value.replace(/\r\n/g, '\n')).toBe(expectedRefs);
  });

  test('Test Case 2.3: Convert Numbers to Tags - Pre-1900 Dates (Assigns "n.d.")', () => {
    const bodyInput = `Early logic [1] and philosophy [2] laid the groundwork.`;
    const refInput = `1. Boole, G. The Mathematical Analysis of Logic; London, UK, 1847.
2. Waddell, W.W. The Parmenides of Plato; Glasgow, UK, 1894.`;

    document.getElementById('docBody').value = bodyInput;
    document.getElementById('refList').value = refInput;

    window.convertToTags();

    expect(document.getElementById('docBody').value).toBe(`Early logic [Boole n.d.] and philosophy [Waddell n.d.] laid the groundwork.`);

    const expectedRefs = `[Boole n.d.] Boole, G. The Mathematical Analysis of Logic; London, UK, 1847.

[Waddell n.d.] Waddell, W.W. The Parmenides of Plato; Glasgow, UK, 1894.`;
    expect(document.getElementById('refList').value.replace(/\r\n/g, '\n')).toBe(expectedRefs);
  });

  test('Test Case 2.4: Convert Numbers to Tags - Tag Collision Resolution', () => {
    const bodyInput = `Multiple publications by the same author in the same year [1-2].`;
    const refInput = `1. Friedman, R. A Perspective on Information Optimality. Signals 2022, 3, 410–427.
2. Friedman, R. Another Paper on Information. Signals 2022, 4, 100-110.`;

    document.getElementById('docBody').value = bodyInput;
    document.getElementById('refList').value = refInput;

    window.convertToTags();

    expect(document.getElementById('docBody').value).toBe(`Multiple publications by the same author in the same year [Friedman 2022; Friedman 2022a].`);

    const expectedRefs = `[Friedman 2022] Friedman, R. A Perspective on Information Optimality. Signals 2022, 3, 410–427.

[Friedman 2022a] Friedman, R. Another Paper on Information. Signals 2022, 4, 100-110.`;
    expect(document.getElementById('refList').value.replace(/\r\n/g, '\n')).toBe(expectedRefs);
  });

  test('Test Case 2.5: Convert Tags to Numbers - Institutional Authors and Trailing Brackets', () => {
    const bodyInput = `Definitions vary significantly [Merriam-Webster 2023].`;
    const refInput = `[Merriam-Webster 2023] Merriam-Webster Dictionary. Available online: https://... (accessed on 6 April 2023). [Google Scholar] [CrossRef]`;

    document.getElementById('docBody').value = bodyInput;
    document.getElementById('refList').value = refInput;

    window.convertToNumbers();

    expect(document.getElementById('docBody').value).toBe(`Definitions vary significantly [1].`);

    const expectedRefs = `1. Merriam-Webster Dictionary. Available online: https://... (accessed on 6 April 2023). [Google Scholar] [CrossRef]`;
    expect(document.getElementById('refList').value.replace(/\r\n/g, '\n')).toBe(expectedRefs);
  });

  test('Test Case 2.6: Convert Tags to Numbers - Unused References Relegated to Bottom', () => {
    const bodyInput = `Language evolution is observable [Scott-Phillips 2010].`;
    const refInput = `[Pinker 1990] Pinker, S.; Bloom, P. Natural language and natural selection.
[Scott-Phillips 2010] Scott-Phillips, T.C.; Kirby, S. Language evolution in the laboratory.
[Hennig 1965] Hennig, W. Phylogenetic Systematics.`;

    document.getElementById('docBody').value = bodyInput;
    document.getElementById('refList').value = refInput;

    window.convertToNumbers();

    expect(document.getElementById('docBody').value).toBe(`Language evolution is observable [1].`);

    const expectedRefs = `1. Scott-Phillips, T.C.; Kirby, S. Language evolution in the laboratory.

2. Pinker, S.; Bloom, P. Natural language and natural selection.

3. Hennig, W. Phylogenetic Systematics.`;
    expect(document.getElementById('refList').value.replace(/\r\n/g, '\n')).toBe(expectedRefs);
  });

  test('Test Case 2.7: Convert Tags to Numbers - Unmapped Tags in Text Maintained', () => {
    const bodyInput = `Neural networks demonstrate logic [Evans 2018; Unknown 2022].`;
    const refInput = `[Evans 2018] Evans, R.; et al. Can Neural Networks Understand Logical Entailment?`;

    document.getElementById('docBody').value = bodyInput;
    document.getElementById('refList').value = refInput;

    window.convertToNumbers();

    expect(document.getElementById('docBody').value).toBe(`Neural networks demonstrate logic [1; Unknown 2022].`);

    const expectedRefs = `1. Evans, R.; et al. Can Neural Networks Understand Logical Entailment?`;
    expect(document.getElementById('refList').value.replace(/\r\n/g, '\n')).toBe(expectedRefs);
  });
});
