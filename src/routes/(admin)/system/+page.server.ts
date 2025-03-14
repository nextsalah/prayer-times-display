import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import type { PageServerLoad, Actions } from './$types';

// Simplified schema focused on version and update capabilities
const versionSettingsSchema = z.object({
    currentVersion: z.string(),
    updateAvailable: z.boolean(),
    latestVersion: z.string().optional()
});

// Function to get the current version from package.json
async function getCurrentVersion() {
    try {
        const packageJsonPath = path.resolve('package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.version || '1.0.0';
    } catch (error) {
        console.error('Error reading package.json:', error);
        return '1.0.0';
    }
}

// Function to check for updates on GitHub
interface GitHubRelease {
    tag_name: string;
    name: string;
    published_at: string;
    html_url: string;
    body?: string;
}

interface UpdateCheckResult {
    updateAvailable: boolean;
    latestVersion: string | null;
}

async function checkForUpdates(currentVersion: string): Promise<UpdateCheckResult> {
    try {
        // Assuming your GitHub repo is accessible and has releases
        // Replace with your actual GitHub repo URL
        const response = await fetch('https://api.github.com/repos/yourusername/yourrepo/releases/latest');
        
        if (!response.ok) {
            throw new Error(`GitHub API responded with status: ${response.status}`);
        }
        
        const data = await response.json() as GitHubRelease;
        
        // GitHub tags often have 'v' prefix, so we remove it for comparison
        const latestVersion = data.tag_name.replace(/^v/, '');
        
        // Simple version comparison - you might want a more robust solution for complex versioning
        const updateAvailable = latestVersion !== currentVersion;
        
        return {
            updateAvailable,
            latestVersion
        };
    } catch (error) {
        console.error('Error checking for updates:', error);
        return {
            updateAvailable: false,
            latestVersion: null
        };
    }
}

export const load: PageServerLoad = async () => {
    const currentVersion = await getCurrentVersion();
    const { updateAvailable, latestVersion } = await checkForUpdates(currentVersion);
    
    // Create the form with current values
    const form = await superValidate({
        currentVersion,
        updateAvailable,
        latestVersion: latestVersion || currentVersion
    }, zod(versionSettingsSchema));
    
    return {
        title: 'Version Settings',
        form
    };
};

export const actions = {
    // Check for updates action
    checkUpdates: async () => {
        const currentVersion = await getCurrentVersion();
        const { updateAvailable, latestVersion } = await checkForUpdates(currentVersion);
        
        const form = await superValidate({
            currentVersion,
            updateAvailable,
            latestVersion: latestVersion || currentVersion
        }, zod(versionSettingsSchema));
        
        return {
            form,
            success: true
        };
    },
    
    // Perform update action
    performUpdate: async () => {
        const currentVersion = await getCurrentVersion();
        
        try {
            // Here you would implement the actual update logic
            // This could involve downloading the new version and applying it
            // For now, we'll just simulate a successful update
            
            const form = await superValidate({
                currentVersion,
                updateAvailable: false,
                latestVersion: currentVersion
            }, zod(versionSettingsSchema));
            
            return {
                form,
                success: true,
                message: 'System updated successfully!'
            };
        } catch (error) {
            const form = await superValidate({
                currentVersion,
                updateAvailable: true,
                latestVersion: currentVersion
            }, zod(versionSettingsSchema));
            
            return fail(500, {
                form,
                error: 'Failed to update system'
            });
        }
    }
} satisfies Actions;