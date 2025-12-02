import { TeamPreset } from './team-preset-types';
import LZString from 'lz-string';

/**
 * Encode a team preset to a URL-safe compressed string
 */
export function encodePresetToURL(preset: TeamPreset): string {
    try {
        const json = JSON.stringify(preset);
        const compressed = LZString.compressToEncodedURIComponent(json);
        return compressed;
    } catch (error) {
        console.error('Failed to encode preset:', error);
        return '';
    }
}

/**
 * Decode a URL parameter to a team preset
 */
export function decodePresetFromURL(urlParam: string): TeamPreset | null {
    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(urlParam);
        if (!decompressed) return null;
        const preset = JSON.parse(decompressed) as TeamPreset;
        return preset;
    } catch (error) {
        console.error('Failed to decode preset:', error);
        return null;
    }
}

/**
 * Generate a shareable URL for a team preset
 */
export function generateShareURL(preset: TeamPreset): string {
    const encoded = encodePresetToURL(preset);
    if (!encoded) return '';

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/calculator?preset=${encoded}`;
}

/**
 * Copy share link to clipboard
 */
export async function copyShareLinkToClipboard(preset: TeamPreset): Promise<boolean> {
    try {
        const shareUrl = generateShareURL(preset);
        if (!shareUrl) return false;

        await navigator.clipboard.writeText(shareUrl);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Parse URL parameters on page load to check for shared preset
 */
export function parseSharedPresetFromURL(): TeamPreset | null {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    const presetParam = params.get('preset');

    if (!presetParam) return null;

    return decodePresetFromURL(presetParam);
}

/**
 * Generate a simple share code (alternative to URL encoding)
 */
export function generateShareCode(preset: TeamPreset): string {
    return encodePresetToURL(preset).substring(0, 12).toUpperCase();
}
