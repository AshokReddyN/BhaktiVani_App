# Stotra Scraper for Stotranidhi.com

Specialized scraper to extract **only the title and stotra content** from Stotranidhi.com pages, automatically filtering out ads, navigation, and other non-stotra elements.

## Features

- ✨ **Clean Extraction**: Gets only title and stotra verses
- 🚫 **Smart Filtering**: Automatically removes ads, notes, breadcrumbs, and promotional content
- 📝 **JSON Output**: Clean, structured JSON format
- 🔥 **Firebase Ready**: Optional Firebase migration format
- 🎯 **Telugu Support**: Properly handles Telugu Unicode characters

## Usage

### Basic Usage

Extract stotra to clean JSON:

```bash
npm run stotra -- --url https://stotranidhi.com/vakratunda-ganesha-stavaraja-in-telugu/
```

### With Firebase Migration Format

Generate both clean JSON and Firebase migration file:

```bash
npm run stotra -- --url https://stotranidhi.com/vakratunda-ganesha-stavaraja-in-telugu/ --firebase
```

### Custom Output Directory

```bash
npm run stotra -- --url https://stotranidhi.com/... --output ./my-stotras
```

## Output Format

### Clean JSON Format

```json
{
  "title": "Vakratunda Ganesha Stavaraja – వక్రతుండ గణేశ స్తవరాజః",
  "content": [
    "అస్య గాయత్రీ మంత్రః |\nఓం తత్పురుషాయ విద్మహే వక్రతుండాయ ధీమహి | తన్నో దంతిః ప్రచోదయాత్ ||",
    "ఓంకారమాద్యం ప్రవదంతి సంతో\nవాచః శ్రుతీనామపి యం గృణంతి |\nగజాననం దేవగణానతాంఘ్రిం\nభజేఽహమర్ధేందుకళావతంసమ్ || ౧ ||",
    ...
  ],
  "metadata": {
    "url": "https://stotranidhi.com/vakratunda-ganesha-stavaraja-in-telugu/",
    "scrapedAt": "2025-11-27T16:52:01.891Z",
    "totalVerses": 23
  }
}
```

### Firebase Migration Format

When using `--firebase` flag, generates a Firebase-ready migration file:

```json
{
  "version": 1,
  "createdAt": "2025-11-27T16:52:01.891Z",
  "source": "https://stotranidhi.com/...",
  "firebaseImport": {
    "__collections__": {
      "stotras": {
        "vakratunda-ganesha-stavaraja-వక్రతుండ-గణేశ-స్తవరాజ": {
          "title": "Vakratunda Ganesha Stavaraja – వక్రతుండ గణేశ స్తవరాజః",
          "content": [...],
          "url": "https://stotranidhi.com/...",
          "totalVerses": 23,
          "language": "telugu",
          "createdAt": { "__datatype__": "timestamp", "value": "..." },
          "updatedAt": { "__datatype__": "timestamp", "value": "..." }
        }
      }
    }
  }
}
```

## What Gets Filtered Out

The scraper automatically removes:

- ❌ Breadcrumb navigation (స్తోత్రనిధి → శ్రీ గణేశ స్తోత్రాలు)
- ❌ Book purchase links and promotions
- ❌ "Read in other languages" links
- ❌ Social sharing buttons
- ❌ Related posts
- ❌ Copyright notices
- ❌ Notes about publications
- ❌ Ads and external links

## What Gets Included

The scraper extracts:

- ✅ Stotra title (from h1.entry-title)
- ✅ Gayatri mantra (if present)
- ✅ All stotra verses with verse numbers
- ✅ Closing line (ఇతి శ్రీ...)

## Command Line Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--url <url>` | `-u` | Stotranidhi URL to scrape | Required |
| `--output <path>` | `-o` | Output directory | `./stotras` |
| `--firebase` | `-f` | Generate Firebase migration format | false |
| `--help` | `-h` | Display help | - |

## Examples

### Example 1: Single Stotra

```bash
npm run stotra -- --url https://stotranidhi.com/vakratunda-ganesha-stavaraja-in-telugu/
```

Output:
```
🔍 Fetching stotra from: https://stotranidhi.com/vakratunda-ganesha-stavaraja-in-telugu/
📖 Found stotra: Vakratunda Ganesha Stavaraja – వక్రతుండ గణేశ స్తవరాజః
✅ Extracted 23 verses/lines

📝 Generating JSON file...
✅ JSON file created: ./stotras/vakratunda-ganesha-stavaraja-వక్రతుండ-గణేశ-స్తవరాజ.json
   - Title: Vakratunda Ganesha Stavaraja – వక్రతుండ గణేశ స్తవరాజః
   - Total verses/lines: 23
   - File size: 2.93 KB

🎉 Process completed successfully!
```

### Example 2: With Firebase Migration

```bash
npm run stotra -- --url https://stotranidhi.com/vakratunda-ganesha-stavaraja-in-telugu/ --firebase
```

Generates two files:
- `vakratunda-ganesha-stavaraja-వక్రతుండ-గణేశ-స్తవరాజ.json` (clean format)
- `vakratunda-ganesha-stavaraja-వక్రతుండ-గణేశ-స్తవరాజ.firebase.json` (Firebase format)

### Example 3: Batch Processing Multiple Stotras

Create a bash script to scrape multiple stotras:

```bash
#!/bin/bash
urls=(
  "https://stotranidhi.com/vakratunda-ganesha-stavaraja-in-telugu/"
  "https://stotranidhi.com/another-stotra-in-telugu/"
  "https://stotranidhi.com/yet-another-stotra-in-telugu/"
)

for url in "${urls[@]}"; do
  npm run stotra -- --url "$url" --firebase
  sleep 2  # Be respectful to the server
done
```

## Integration with BhaktiVani App

### 1. Scrape Stotras

```bash
npm run stotra -- --url https://stotranidhi.com/your-stotra/ --firebase
```

### 2. Import to Firebase

Use the generated Firebase migration file with Firebase Admin SDK:

```javascript
import admin from 'firebase-admin';
import fs from 'fs';

const migration = JSON.parse(fs.readFileSync('stotra.firebase.json', 'utf8'));
const db = admin.firestore();

const stotras = migration.firebaseImport.__collections__.stotras;
for (const [id, data] of Object.entries(stotras)) {
  await db.collection('stotras').doc(id).set(data);
}
```

### 3. Use in Your App

The clean JSON format is perfect for direct use in your React Native app:

```typescript
import stotraData from './stotras/vakratunda-ganesha-stavaraja.json';

// Display title
<Text>{stotraData.title}</Text>

// Display verses
{stotraData.content.map((verse, index) => (
  <Text key={index}>{verse}</Text>
))}
```

## Troubleshooting

### Issue: "Could not find stotra title"

**Solution**: Make sure the URL is a valid Stotranidhi.com stotra page, not a category or home page.

### Issue: Too much content extracted

**Solution**: The scraper is designed for standard Stotranidhi pages. If the page has a different structure, you may need to adjust the filtering logic in `stotra-scraper.js`.

### Issue: Missing verses

**Solution**: Check if the verses use different markers. The scraper looks for `||` markers and Telugu script. You may need to adjust the `filterStotraContent()` function.

## Technical Details

### How It Works

1. **Fetch**: Downloads the HTML page using axios
2. **Parse**: Uses cheerio to parse the HTML
3. **Extract Title**: Gets text from `h1.entry-title`
4. **Extract Content**: Gets all `<p>` tags from `div.entry-content`
5. **Filter**: Removes non-stotra content using pattern matching
6. **Generate**: Creates clean JSON and optional Firebase format

### Filtering Logic

The scraper uses multiple strategies to identify stotra content:

- Looks for Telugu Unicode characters (U+0C00 to U+0C7F)
- Identifies verse markers (`||`)
- Detects verse numbers (`|| 1 ||`, `|| 2 ||`, etc.)
- Recognizes mantra patterns
- Finds closing lines (`ఇతి శ్రీ...`)

## Best Practices

1. **Test First**: Always test with a single URL before batch processing
2. **Review Output**: Check the generated JSON to ensure quality
3. **Rate Limiting**: Add delays between requests when scraping multiple pages
4. **Backup**: Keep the original URLs in case you need to re-scrape

## License

MIT

---

**Note**: This scraper is specifically designed for Stotranidhi.com. For other websites, use the general `scraper.js` tool.
