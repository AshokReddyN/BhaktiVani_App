import Fuse from 'fuse.js';
import Deity from '../database/models/Deity';

/**
 * Common prefixes to remove during normalization
 */
const PREFIXES = ['sri', 'shri', 'lord', 'goddess', 'devi', 'swami'];

/**
 * Normalize text for search matching
 * - Converts to lowercase
 * - Removes common prefixes
 * - Removes spaces and special characters
 */
export const normalizeText = (text: string): string => {
    if (!text) return '';

    let normalized = text.toLowerCase().trim();

    // Remove common prefixes
    for (const prefix of PREFIXES) {
        const prefixPattern = new RegExp(`^${prefix}\\s*`, 'i');
        normalized = normalized.replace(prefixPattern, '');
    }

    // Remove spaces and special characters, keep only alphanumeric
    normalized = normalized.replace(/[^a-z0-9]/g, '');

    return normalized;
};

/**
 * Tokenize a query into potential deity name components
 * Handles combined names like "ramakrishna" -> ["rama", "krishna"]
 */
export const tokenizeQuery = (query: string): string[] => {
    const normalized = normalizeText(query);

    if (normalized.length === 0) return [];

    // Common deity name patterns for splitting
    const commonNames = [
        'rama', 'krishna', 'shiva', 'vishnu', 'ganesha', 'ganesh',
        'hanuman', 'lakshmi', 'saraswati', 'durga', 'kali',
        'venkateswara', 'venkatesh', 'balaji'
    ];

    const tokens: string[] = [];

    // Try to find known deity names within the query
    for (const name of commonNames) {
        if (normalized.includes(name)) {
            tokens.push(name);
        }
    }

    // If no known names found, use the whole query
    if (tokens.length === 0) {
        tokens.push(normalized);
    }

    return tokens;
};

/**
 * Search deities using fuzzy matching with normalization
 * Supports multi-token queries and multi-language names
 */
export const searchDeities = (
    deities: Deity[],
    query: string,
    currentLanguage: 'telugu' | 'kannada' = 'telugu'
): Deity[] => {
    if (!query || query.trim().length === 0) {
        return deities;
    }

    const normalizedQuery = query.toLowerCase().trim();

    // First try simple substring matching for better UX
    const substringMatches = deities.filter(deity => {
        const name = deity.name.toLowerCase();
        const english = (deity.nameEnglish || '').toLowerCase();
        const telugu = (deity.nameTelugu || '').toLowerCase();
        const kannada = (deity.nameKannada || '').toLowerCase();

        return name.includes(normalizedQuery) ||
            english.includes(normalizedQuery) ||
            telugu.includes(normalizedQuery) ||
            kannada.includes(normalizedQuery);
    });

    // If we have substring matches, return them
    if (substringMatches.length > 0) {
        return substringMatches;
    }

    // Otherwise, try fuzzy search for typos and variations
    const tokens = tokenizeQuery(query);

    // Configure Fuse.js for fuzzy search
    const fuse = new Fuse(deities, {
        keys: [
            { name: 'name', weight: 1.0 },
            { name: 'nameEnglish', weight: 1.0 },
            { name: 'nameTelugu', weight: 0.9 },
            { name: 'nameKannada', weight: 0.9 }
        ],
        threshold: 0.6, // More lenient for fuzzy matching
        distance: 100,
        includeScore: true,
        ignoreLocation: true,
    });

    // Search for each token
    const results = new Map<string, { deity: Deity; score: number }>();

    for (const token of tokens) {
        const searchResults = fuse.search(token);

        for (const result of searchResults) {
            const deity = result.item;
            const score = result.score || 0;

            // Also check normalized names for exact/partial matches
            const normalizedName = normalizeText(deity.name);
            const normalizedTelugu = normalizeText(deity.nameTelugu || '');
            const normalizedKannada = normalizeText(deity.nameKannada || '');

            const exactMatch =
                normalizedName.includes(token) ||
                normalizedTelugu.includes(token) ||
                normalizedKannada.includes(token);

            // Boost score for exact matches
            const finalScore = exactMatch ? score * 0.5 : score;

            // Keep best score for each deity
            if (!results.has(deity.id) || results.get(deity.id)!.score > finalScore) {
                results.set(deity.id, { deity, score: finalScore });
            }
        }
    }

    // Sort by score (lower is better in Fuse.js)
    return Array.from(results.values())
        .sort((a, b) => a.score - b.score)
        .map(r => r.deity);
};

/**
 * Get display name for deity based on current language
 */
export const getDeityDisplayName = (
    deity: Deity,
    language: 'telugu' | 'kannada'
): string => {
    if (language === 'telugu') {
        return deity.nameTelugu || deity.name;
    } else {
        return deity.nameKannada || deity.name;
    }
};
