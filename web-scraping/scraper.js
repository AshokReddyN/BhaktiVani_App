#!/usr/bin/env node

import axios from 'axios';
import * as cheerio from 'cheerio';
import { program } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scrape data from a given URL
 * @param {string} url - The URL to scrape
 * @returns {Promise<Object>} Scraped data
 */
async function scrapeUrl(url) {
    try {
        console.log(`🔍 Fetching data from: ${url}`);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        });

        const $ = cheerio.load(response.data);

        // Extract data - customize this based on your needs
        const scrapedData = {
            url: url,
            title: $('title').text().trim() || 'Untitled',
            headings: [],
            paragraphs: [],
            links: [],
            images: [],
            metadata: {
                description: $('meta[name="description"]').attr('content') || '',
                keywords: $('meta[name="keywords"]').attr('content') || '',
                author: $('meta[name="author"]').attr('content') || '',
            },
            scrapedAt: new Date().toISOString()
        };

        // Extract headings
        $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text) {
                scrapedData.headings.push({
                    level: elem.name,
                    text: text
                });
            }
        });

        // Extract paragraphs
        $('p').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text && text.length > 10) {
                scrapedData.paragraphs.push(text);
            }
        });

        // Extract links
        $('a[href]').each((i, elem) => {
            const href = $(elem).attr('href');
            const text = $(elem).text().trim();
            if (href && text) {
                scrapedData.links.push({
                    url: href,
                    text: text
                });
            }
        });

        // Extract images
        $('img[src]').each((i, elem) => {
            const src = $(elem).attr('src');
            const alt = $(elem).attr('alt') || '';
            if (src) {
                scrapedData.images.push({
                    src: src,
                    alt: alt
                });
            }
        });

        console.log(`✅ Successfully scraped data from ${url}`);
        console.log(`   - Found ${scrapedData.headings.length} headings`);
        console.log(`   - Found ${scrapedData.paragraphs.length} paragraphs`);
        console.log(`   - Found ${scrapedData.links.length} links`);
        console.log(`   - Found ${scrapedData.images.length} images`);

        return scrapedData;
    } catch (error) {
        console.error(`❌ Error scraping URL: ${error.message}`);
        throw error;
    }
}

/**
 * Generate Firebase migration file from scraped data
 * @param {Object} data - Scraped data
 * @param {string} outputPath - Path to save the migration file
 */
async function generateFirebaseMigration(data, outputPath) {
    try {
        console.log(`\n📝 Generating Firebase migration file...`);

        // Create migration structure
        const migration = {
            version: 1,
            createdAt: new Date().toISOString(),
            source: data.url,
            collections: {
                // Main content collection
                content: {
                    id: generateId(data.title),
                    title: data.title,
                    url: data.url,
                    description: data.metadata.description,
                    author: data.metadata.author,
                    keywords: data.metadata.keywords,
                    headings: data.headings,
                    paragraphs: data.paragraphs,
                    links: data.links,
                    images: data.images,
                    createdAt: data.scrapedAt,
                    updatedAt: data.scrapedAt
                }
            },
            // Firebase import format
            firebaseImport: {
                __collections__: {
                    scrapedContent: {
                        [generateId(data.title)]: {
                            title: data.title,
                            url: data.url,
                            description: data.metadata.description,
                            author: data.metadata.author,
                            keywords: data.metadata.keywords,
                            headingsCount: data.headings.length,
                            paragraphsCount: data.paragraphs.length,
                            linksCount: data.links.length,
                            imagesCount: data.images.length,
                            fullData: data,
                            createdAt: { __datatype__: 'timestamp', value: data.scrapedAt },
                            updatedAt: { __datatype__: 'timestamp', value: data.scrapedAt }
                        }
                    }
                }
            }
        };

        // Write migration file
        const migrationJson = JSON.stringify(migration, null, 2);
        await fs.writeFile(outputPath, migrationJson, 'utf8');

        console.log(`✅ Migration file created: ${outputPath}`);
        console.log(`   - File size: ${(migrationJson.length / 1024).toFixed(2)} KB`);

        // Also create a simplified version for easy import
        const simplifiedPath = outputPath.replace('.json', '.simplified.json');
        const simplified = {
            title: data.title,
            url: data.url,
            description: data.metadata.description,
            content: {
                headings: data.headings,
                paragraphs: data.paragraphs.slice(0, 10), // First 10 paragraphs
                links: data.links.slice(0, 20), // First 20 links
                images: data.images.slice(0, 10) // First 10 images
            },
            scrapedAt: data.scrapedAt
        };

        await fs.writeFile(simplifiedPath, JSON.stringify(simplified, null, 2), 'utf8');
        console.log(`✅ Simplified version created: ${simplifiedPath}`);

        return migration;
    } catch (error) {
        console.error(`❌ Error generating migration file: ${error.message}`);
        throw error;
    }
}

/**
 * Generate a unique ID from a string
 * @param {string} str - Input string
 * @returns {string} Generated ID
 */
function generateId(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50) + '-' + Date.now();
}

/**
 * Main function
 */
async function main() {
    program
        .name('scraper')
        .description('Web scraping tool to extract data and generate Firebase migration files')
        .version('1.0.0')
        .option('-u, --url <url>', 'URL to scrape')
        .option('-o, --output <path>', 'Output path for migration file', './migrations')
        .option('-t, --test', 'Run with test URL')
        .parse(process.argv);

    const options = program.opts();

    // Use test URL if --test flag is provided
    let targetUrl = options.url;
    if (options.test) {
        targetUrl = 'https://example.com';
        console.log('🧪 Running in test mode with example.com\n');
    }

    if (!targetUrl) {
        console.error('❌ Error: Please provide a URL using --url option or use --test flag');
        console.log('\nUsage:');
        console.log('  npm run scrape -- --url https://example.com');
        console.log('  npm run scrape -- --test');
        process.exit(1);
    }

    try {
        // Create output directory if it doesn't exist
        const outputDir = path.resolve(__dirname, options.output);
        await fs.mkdir(outputDir, { recursive: true });

        // Scrape the URL
        const scrapedData = await scrapeUrl(targetUrl);

        // Generate migration file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `migration-${generateId(scrapedData.title)}.json`;
        const outputPath = path.join(outputDir, filename);

        await generateFirebaseMigration(scrapedData, outputPath);

        console.log('\n🎉 Process completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Review the generated migration file');
        console.log('2. Import to Firebase using Firebase Admin SDK or Firebase Console');
        console.log('3. Update your Firebase security rules if needed');

    } catch (error) {
        console.error('\n❌ Process failed:', error.message);
        process.exit(1);
    }
}

// Run the main function
main();
