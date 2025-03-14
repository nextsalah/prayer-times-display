import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { PageServerLoad, Actions } from './$types';

const execAsync = promisify(exec);

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
    assets: {
        browser_download_url: string;
        name: string;
    }[];
    body?: string;
}

interface UpdateCheckResult {
    updateAvailable: boolean;
    latestVersion: string | null;
    downloadUrl?: string;
    releaseInfo?: GitHubRelease;
}

// Replace these with your actual GitHub repository details
const GITHUB_REPO_OWNER = "nextsalah";
const GITHUB_REPO_NAME = "prayer-times-display";

async function checkForUpdates(currentVersion: string): Promise<UpdateCheckResult> {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`);

        if (!response.ok) {
            throw new Error(`GitHub API responded with status: ${response.status}`);
        }

        const data = await response.json() as GitHubRelease;

        // GitHub tags often have 'v' prefix, so we remove it for comparison
        const latestVersion = data.tag_name.replace(/^v/, '');

        // Simple version comparison - you might want a more robust solution for complex versioning
        const updateAvailable = latestVersion !== currentVersion;

        // Find the download URL for the tarball
        let downloadUrl = '';
        if (data.assets && data.assets.length > 0) {
            const tarballAsset = data.assets.find(asset => 
                asset.name.includes(latestVersion) && asset.name.endsWith('.tar.gz')
            );
            
            if (tarballAsset) {
                downloadUrl = tarballAsset.browser_download_url;
            }
        }

        // If no asset found, construct a likely URL
        if (!downloadUrl) {
            downloadUrl = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/download/${data.tag_name}/prayer-times-display-${latestVersion}.tar.gz`;
        }

        return {
            updateAvailable,
            latestVersion,
            downloadUrl,
            releaseInfo: data
        };
    } catch (error) {
        console.error('Error checking for updates:', error);
        return {
            updateAvailable: false,
            latestVersion: null
        };
    }
}

// Function to download and apply an update
async function downloadAndApplyUpdate(downloadUrl: string): Promise<boolean> {
    try {
        // Create temp directory for the update
        const tmpDir = fs.mkdtempSync(path.join(path.resolve('..'), 'update-'));
        console.log(`Created temporary directory: ${tmpDir}`);

        const tarballPath = path.join(tmpDir, 'update.tar.gz');
        
        // Download the update file
        console.log(`Downloading update from: ${downloadUrl}`);
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to download update: ${response.status} ${response.statusText}`);
        }
        
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(tarballPath, new Uint8Array(buffer));
        console.log(`Downloaded update to: ${tarballPath}`);
        
        // Extract the update
        const extractDir = path.join(tmpDir, 'extract');
        fs.mkdirSync(extractDir, { recursive: true });
        
        console.log(`Extracting update to: ${extractDir}`);
        await execAsync(`tar -xzf ${tarballPath} -C ${extractDir}`);
        
        // Find the extracted directory
        let updateDir = extractDir;
        const files = fs.readdirSync(extractDir);
        if (files.length === 1 && fs.statSync(path.join(extractDir, files[0])).isDirectory()) {
            updateDir = path.join(extractDir, files[0]);
        }
        
        console.log(`Update extracted to: ${updateDir}`);
        
        // Get the current application directory
        const appDir = path.resolve('.');
        console.log(`Application directory: ${appDir}`);
        
        // Create a backup of the current application
        const backupDir = path.join(path.resolve('..'), `backup-${new Date().toISOString().replace(/:/g, '-')}`);
        console.log(`Creating backup at: ${backupDir}`);
        await execAsync(`cp -R ${appDir} ${backupDir}`);
        
        // Copy new files to the application directory
        // Exclude node_modules, .env, and other configuration files
        console.log('Applying update...');
        await execAsync(`rsync -av --exclude="node_modules" --exclude=".env" --exclude=".git" ${updateDir}/ ${appDir}/`);
        
        // Install dependencies
        console.log('Installing dependencies...');
        await execAsync('bun install', { cwd: appDir });
        
        // Build the application
        console.log('Building application...');
        await execAsync('bun run build', { cwd: appDir, timeout: 60000 }); // 60 second timeout
        
        // Clean up
        console.log('Cleaning up...');
        fs.rmSync(tmpDir, { recursive: true, force: true });
        
        console.log('Update completed successfully');
        return true;
    } catch (error) {
        console.error('Error applying update:', error);
        return false;
    }
}

// Function to restart the application
async function restartApplication(): Promise<void> {
    try {
        // Check if running under a process manager like PM2
        if (process.env.PM2_HOME) {
            console.log('Restarting application with PM2...');
            await execAsync('pm2 restart all');
        } else if (process.env.NODE_APP_INSTANCE) {
            // Running under another process manager that sets NODE_APP_INSTANCE
            console.log('Process manager detected. Application will restart on next deployment.');
        } else {
            // As we're running under SvelteKit/Bun, we can't easily restart ourselves
            // Here we're just going to log that a restart is needed
            console.log('Manual restart required to apply the update.');
        }
    } catch (error) {
        console.error('Error restarting application:', error);
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
            // Check for updates
            const { updateAvailable, latestVersion, downloadUrl } = await checkForUpdates(currentVersion);
            
            if (!updateAvailable || !latestVersion || !downloadUrl) {
                console.log('No update available or missing update information');
                const form = await superValidate({
                    currentVersion,
                    updateAvailable: false,
                    latestVersion: currentVersion
                }, zod(versionSettingsSchema));
                
                return {
                    form,
                    success: false,
                    message: 'No update available.'
                };
            }
            
            console.log(`Update available: ${currentVersion} -> ${latestVersion}`);
            console.log(`Download URL: ${downloadUrl}`);
            
            // Download and apply the update
            const updateSuccess = await downloadAndApplyUpdate(downloadUrl);
            
            if (!updateSuccess) {
                throw new Error('Failed to apply update');
            }
            
            // Schedule a restart if possible
            await restartApplication();
            
            // Return success response
            const form = await superValidate({
                currentVersion: latestVersion, // Update to the new version
                updateAvailable: false,
                latestVersion: latestVersion
            }, zod(versionSettingsSchema));
            
            return {
                form,
                success: true,
                message: `System updated successfully to version ${latestVersion}! A restart may be required to complete the update.`
            };
        } catch (error) {
            console.error('Update failed:', error);
            
            const form = await superValidate({
                currentVersion,
                updateAvailable: true,
                latestVersion: currentVersion
            }, zod(versionSettingsSchema));
            
            return fail(500, {
                form,
                error: `Failed to update system: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }
} satisfies Actions;