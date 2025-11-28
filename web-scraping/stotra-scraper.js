#!/usr/bin/env node

/**
 * Specialized scraper for Stotranidhi.com
 * Extracts only the title and stotra content, ignoring ads and other elements
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { program } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scrape stotra from Stotranidhi.com
 * @param {string} url - The URL to scrape
 * @returns {Promise<Object>} Scraped stotra data
 */
async function scrapeStotra(url) {
    try {
        console.log(`🔍 Fetching stotra from: ${url}`);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        });

        const $ = cheerio.load(response.data);

        // Extract title from h1.entry-title
        const title = $('h1.entry-title').text().trim();

        if (!title) {
            throw new Error('Could not find stotra title. Make sure this is a valid Stotranidhi URL.');
        }

        console.log(`📖 Found stotra: ${title}`);

        // Extract stotra content from div.entry-content
        const contentDiv = $('div.entry-content');

        if (contentDiv.length === 0) {
            throw new Error('Could not find stotra content.');
        }

        // Get all paragraphs
        const allParagraphs = [];
        contentDiv.find('p').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text) {
                allParagraphs.push(text);
            }
        });

        // Filter out non-stotra content
        const stotraContent = filterStotraContent(allParagraphs);

        if (stotraContent.length === 0) {
            throw new Error('No stotra content found after filtering.');
        }

        console.log(`✅ Extracted ${stotraContent.length} verses/lines`);

        const stotraData = {
            title: title,
            content: stotraContent,
            url: url,
            scrapedAt: new Date().toISOString()
        };

        return stotraData;
    } catch (error) {
        console.error(`❌ Error scraping stotra: ${error.message}`);
        throw error;
    }
}

/**
 * Filter out non-stotra content (ads, notes, links, etc.)
 * @param {Array<string>} paragraphs - All paragraphs from the page
 * @returns {Array<string>} Filtered stotra content
 */
function filterStotraContent(paragraphs) {
    const filtered = [];
    let foundFirstVerse = false;

    for (const para of paragraphs) {
        // Skip empty paragraphs
        if (!para || para.length < 3) {
            continue;
        }

        // Skip paragraphs that are clearly not stotra content
        if (
            para.includes('Click here to buy') ||
            para.includes('గమనిక:') ||
            para.includes('(గమనిక') ||
            para.includes('మరిన్ని') ||
            para.includes('చూడండి') ||
            para.includes('Share this:') ||
            para.includes('Related') ||
            para.includes('Tweet') ||
            para.includes('pinterest.com') ||
            para.includes('twitter.com') ||
            para.includes('facebook.com') ||
            para.includes('Read in') ||
            para.includes('Chant other stotras') ||
            para.includes('Did you see any mistake') ||
            para.includes('పైరసీ ప్రకటన') ||
            para.includes('Our publication') ||
            para.includes('మా తదుపరి ప్రచురణలు') ||
            para.includes('ముద్రించుటకు ఆలోచన') ||
            para.includes('స్తోత్రనిధి →') ||
            para.includes('(నిత్య పారాయణ గ్రంథము)') ||
            para.startsWith('http') ||
            para.match(/^\d+\.\s*$/) // Just numbers
        ) {
            continue;
        }

        // Check if this looks like a stotra/tarpanam verse
        // Stotra verses contain Indic scripts (Telugu, Kannada, Tamil, Devanagari, etc.)
        const hasIndicScript = /[\u0900-\u0D7F]/.test(para); // Covers Devanagari, Bengali, Gujarati, Oriya, Tamil, Telugu, Kannada, Malayalam
        const hasVerseMarker = /\|\|/.test(para); // Double pipe verse end marker
        const hasSinglePipe = /\|/.test(para); // Single pipe marker (common in tarpanams)
        const hasVerseNumber = /\|\|\s*\d+\s*\|\|/.test(para); // Verse number like || 1 ||
        const hasNumberedVerse = /^\d+\.\s+/.test(para) && hasIndicScript; // Numbered verse like "1. verse text"
        const isMantra = para.includes('అస్య గాయత్రీ మంత్రః') ||
            para.includes('ಅಸ್ಯ ಗಾಯತ್ರೀ ಮಂತ್ರಃ') ||
            para.includes('ఓం తత్పురుషాయ') ||
            para.includes('ಓం తత్పురుషాయ');
        const isViniyoga = para.includes('వినియోగః') || para.includes('ವಿನಿಯೋಗಃ'); // Ritual usage declaration
        const isTarpanam = para.includes('తర్పయామి') || para.includes('ತರ್ಪయాಮಿ'); // Tarpanam offering
        const isClosing = (para.includes('ఇతి శ్రీ') || para.includes('ಇತಿ ಶ್ರೀ')) &&
            (para.includes('స్తవరాజః') || para.includes('ಸ್ತವರాజಃ') ||
                para.includes('తర్పణం') || para.includes('ತರ್ಪಣಂ') ||
                para.includes('లహరీ') || para.includes('ಲహರೀ'));

        // Start capturing when we find the first verse, mantra, viniyoga, tarpanam, or numbered verse
        // Be more flexible - start on any content that looks like a verse
        if (!foundFirstVerse && (isMantra || hasVerseNumber || isViniyoga || isTarpanam || hasNumberedVerse ||
            (hasIndicScript && (hasVerseMarker || hasSinglePipe)))) {
            foundFirstVerse = true;
        }

        // If we've found the first verse and this has Indic script or markers, include it
        if (foundFirstVerse && (hasIndicScript || hasVerseMarker || hasSinglePipe)) {
            filtered.push(para);

            // Stop after the closing line
            if (isClosing) {
                break;
            }
        }
    }

    return filtered;
}

/**
 * Generate clean JSON output
 * @param {Object} stotraData - Scraped stotra data
 * @param {string} outputPath - Path to save the JSON file
 */
async function generateJSON(stotraData, outputPath) {
    try {
        console.log(`\n📝 Generating JSON file...`);

        // Create clean JSON structure
        const jsonOutput = {
            title: stotraData.title,
            content: stotraData.content,
            metadata: {
                url: stotraData.url,
                scrapedAt: stotraData.scrapedAt,
                totalVerses: stotraData.content.length
            }
        };

        // Write JSON file
        const jsonString = JSON.stringify(jsonOutput, null, 2);
        await fs.writeFile(outputPath, jsonString, 'utf8');

        console.log(`✅ JSON file created: ${outputPath}`);
        console.log(`   - Title: ${stotraData.title}`);
        console.log(`   - Total verses/lines: ${stotraData.content.length}`);
        console.log(`   - File size: ${(jsonString.length / 1024).toFixed(2)} KB`);

        return jsonOutput;
    } catch (error) {
        console.error(`❌ Error generating JSON: ${error.message}`);
        throw error;
    }
}

/**
 * Detect language from content
 * @param {Array<string>} content - Stotra content
 * @returns {string} Detected language
 */
function detectLanguage(content) {
    const text = content.join(' ');

    // Check for different Indic scripts
    if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu';
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kannada';
    if (/[\u0B80-\u0BFF]/.test(text)) return 'tamil';
    if (/[\u0900-\u097F]/.test(text)) return 'hindi'; // Devanagari
    if (/[\u0D00-\u0D7F]/.test(text)) return 'malayalam';

    return 'unknown';
}

/**
 * Generate Firebase migration format
 * @param {Object} stotraData - Scraped stotra data
 * @param {string} outputPath - Path to save the migration file
 */
async function generateFirebaseMigration(stotraData, outputPath) {
    try {
        console.log(`\n📝 Generating Firebase migration file...`);

        // Generate unique ID from title
        const id = generateId(stotraData.title);

        // Auto-detect language
        const language = detectLanguage(stotraData.content);

        // Create Firebase migration structure
        const migration = {
            version: 1,
            createdAt: new Date().toISOString(),
            source: stotraData.url,
            firebaseImport: {
                __collections__: {
                    stotras: {
                        [id]: {
                            title: stotraData.title,
                            content: stotraData.content,
                            url: stotraData.url,
                            totalVerses: stotraData.content.length,
                            language: language,
                            createdAt: { __datatype__: 'timestamp', value: stotraData.scrapedAt },
                            updatedAt: { __datatype__: 'timestamp', value: stotraData.scrapedAt }
                        }
                    }
                }
            }
        };

        // Write migration file
        const migrationJson = JSON.stringify(migration, null, 2);
        await fs.writeFile(outputPath, migrationJson, 'utf8');

        console.log(`✅ Firebase migration file created: ${outputPath}`);
        console.log(`   - Document ID: ${id}`);
        console.log(`   - Collection: stotras`);
        console.log(`   - File size: ${(migrationJson.length / 1024).toFixed(2)} KB`);

        return migration;
    } catch (error) {
        console.error(`❌ Error generating Firebase migration: ${error.message}`);
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
        .replace(/[^a-z0-9\u0C00-\u0C7F]+/g, '-') // Keep Telugu characters
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
}

/**
 * Main function
 */
async function main() {
    program
        .name('stotra-scraper')
        .description('Specialized scraper for Stotranidhi.com to extract stotra title and content')
        .version('1.0.0')
        .option('-u, --url <url>', 'Stotranidhi URL to scrape')
        .option('-o, --output <path>', 'Output directory for JSON files', './stotras')
        .option('-f, --firebase', 'Generate Firebase migration format')
        .parse(process.argv);

    const options = program.opts();

    if (!options.url) {
        console.error('❌ Error: Please provide a Stotranidhi URL using --url option');
        console.log('\nUsage:');
        console.log('  npm run stotra -- --url https://stotranidhi.com/...');
        console.log('\nExample:');
        console.log('  npm run stotra -- --url https://stotranidhi.com/vakratunda-ganesha-stavaraja-in-telugu/');
        process.exit(1);
    }

    // Validate URL
    if (!options.url.includes('stotranidhi.com')) {
        console.error('❌ Error: This scraper is designed for Stotranidhi.com URLs only');
        process.exit(1);
    }

    try {
        // Create output directory if it doesn't exist
        const outputDir = path.resolve(__dirname, options.output);
        await fs.mkdir(outputDir, { recursive: true });

        // Scrape the stotra
        const stotraData = await scrapeStotra(options.url);

        // Generate filename from title
        const filename = generateId(stotraData.title);

        // Generate clean JSON
        const jsonPath = path.join(outputDir, `${filename}.json`);
        await generateJSON(stotraData, jsonPath);

        // Generate Firebase migration if requested
        if (options.firebase) {
            const migrationPath = path.join(outputDir, `${filename}.firebase.json`);
            await generateFirebaseMigration(stotraData, migrationPath);
        }

        console.log('\n🎉 Process completed successfully!');
        console.log('\nGenerated files:');
        console.log(`  - ${jsonPath}`);
        if (options.firebase) {
            console.log(`  - ${path.join(outputDir, `${filename}.firebase.json`)}`);
        }

    } catch (error) {
        console.error('\n❌ Process failed:', error.message);
        process.exit(1);
    }
}

// Run the main function
main();
