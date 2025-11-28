# Web Scraping to Firebase Migration Tool

This tool allows you to scrape data from any URL and generate Firebase migration files that can be imported into your Firebase Firestore database.

## Features

- 🔍 **Web Scraping**: Extract data from any URL including headings, paragraphs, links, images, and metadata
- 📝 **Firebase Migration**: Generate properly formatted migration files for Firebase import
- 🎯 **Flexible Output**: Creates both full and simplified JSON formats
- 🧪 **Test Mode**: Built-in test mode for quick validation

## Installation

1. Navigate to the web-scraping directory:
```bash
cd web-scraping
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Basic Usage

Scrape a URL and generate migration file:
```bash
npm run scrape -- --url https://example.com
```

### Test Mode

Run with a test URL (example.com):
```bash
npm run scrape -- --test
```

### Custom Output Directory

Specify a custom output directory:
```bash
npm run scrape -- --url https://example.com --output ./my-migrations
```

### Direct Node Execution

You can also run the scraper directly:
```bash
node scraper.js --url https://example.com
```

## Command Line Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--url <url>` | `-u` | URL to scrape | Required (unless --test) |
| `--output <path>` | `-o` | Output directory for migration files | `./migrations` |
| `--test` | `-t` | Run in test mode with example.com | - |
| `--help` | `-h` | Display help information | - |
| `--version` | `-V` | Display version number | - |

## Output Files

The tool generates two files for each scrape:

### 1. Full Migration File
`migration-{title}-{timestamp}.json`

Contains complete data structure including:
- Source URL and metadata
- All scraped content (headings, paragraphs, links, images)
- Firebase import format with timestamps
- Collection structure ready for Firestore

### 2. Simplified Migration File
`migration-{title}-{timestamp}.simplified.json`

Contains condensed data with:
- First 10 paragraphs
- First 20 links
- First 10 images
- Essential metadata

## Scraped Data Structure

The scraper extracts the following data from each URL:

```javascript
{
  url: "https://example.com",
  title: "Page Title",
  headings: [
    { level: "h1", text: "Main Heading" },
    { level: "h2", text: "Subheading" }
  ],
  paragraphs: ["Paragraph text..."],
  links: [
    { url: "https://...", text: "Link text" }
  ],
  images: [
    { src: "https://...", alt: "Image description" }
  ],
  metadata: {
    description: "Page description",
    keywords: "keyword1, keyword2",
    author: "Author name"
  },
  scrapedAt: "2025-11-27T16:32:09.000Z"
}
```

## Firebase Import

### Using Firebase Console

1. Go to Firebase Console → Firestore Database
2. Click on "Import/Export"
3. Select "Import data"
4. Upload the generated migration JSON file

### Using Firebase Admin SDK

```javascript
import admin from 'firebase-admin';
import fs from 'fs';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert('path/to/serviceAccountKey.json')
});

const db = admin.firestore();

// Read migration file
const migration = JSON.parse(fs.readFileSync('migration-file.json', 'utf8'));

// Import to Firestore
async function importData() {
  const batch = db.batch();
  const collectionRef = db.collection('scrapedContent');
  
  for (const [id, data] of Object.entries(migration.firebaseImport.__collections__.scrapedContent)) {
    const docRef = collectionRef.doc(id);
    batch.set(docRef, data);
  }
  
  await batch.commit();
  console.log('Data imported successfully!');
}

importData();
```

## Customization

### Modify Data Extraction

Edit the `scrapeUrl()` function in `scraper.js` to customize what data is extracted:

```javascript
// Add custom selectors
const customData = {
  articles: [],
  videos: []
};

$('.article').each((i, elem) => {
  customData.articles.push({
    title: $(elem).find('.title').text(),
    content: $(elem).find('.content').text()
  });
});
```

### Modify Migration Format

Edit the `generateFirebaseMigration()` function to customize the output structure:

```javascript
const migration = {
  // Add your custom structure here
  myCustomCollection: {
    // Your data
  }
};
```

## Error Handling

The tool includes comprehensive error handling for:
- Network errors (timeouts, connection issues)
- Invalid URLs
- Missing data
- File system errors

Errors are logged with descriptive messages to help troubleshoot issues.

## Examples

### Example 1: Scrape a Blog Post

```bash
npm run scrape -- --url https://blog.example.com/my-post
```

### Example 2: Scrape Multiple URLs

Create a bash script:

```bash
#!/bin/bash
urls=(
  "https://example.com/page1"
  "https://example.com/page2"
  "https://example.com/page3"
)

for url in "${urls[@]}"; do
  npm run scrape -- --url "$url"
  sleep 2  # Be respectful to the server
done
```

### Example 3: Scrape and Auto-Import

```bash
# Scrape
npm run scrape -- --url https://example.com

# Import to Firebase (requires Firebase CLI)
firebase firestore:import ./migrations
```

## Best Practices

1. **Respect robots.txt**: Always check the website's robots.txt file
2. **Rate Limiting**: Add delays between requests when scraping multiple URLs
3. **User Agent**: The tool uses a standard browser user agent
4. **Error Handling**: Review error messages and adjust selectors as needed
5. **Data Validation**: Always review generated migration files before importing

## Troubleshooting

### Issue: No data extracted

**Solution**: The website might use JavaScript to load content. Consider using Puppeteer for dynamic content:

```bash
npm install puppeteer
```

### Issue: Timeout errors

**Solution**: Increase timeout in scraper.js:

```javascript
timeout: 60000  // 60 seconds
```

### Issue: Migration file too large

**Solution**: Use the simplified version or filter data before generating migration.

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
