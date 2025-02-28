import ngrok from 'ngrok';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Simple console logger to avoid path issues
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => {}, // Disable debug logs to reduce noise
  ngrok: (message: string, ...args: any[]) => console.log(`[NGROK] ${message}`, ...args)
};

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        const trimmedLine = line.trim();
        // Skip comments and empty lines
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        
        const match = trimmedLine.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          // Only set if not already in environment
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
      logger.info('Loaded environment variables from .env file');
    } else {
      logger.info('No .env file found, using default environment variables');
    }
  } catch (error) {
    logger.error('Error loading .env file:', error);
  }
}

// Load environment variables
loadEnv();

// Configuration
const PORT = parseInt(process.env.VITE_PORT || '5000'); // Get port from env or use default
const HOST = 'localhost'; // The local host your Vite server runs on
const NGROK_AUTHTOKEN = process.env.NGROK_AUTHTOKEN || ''; // Your ngrok authtoken
// Define valid ngrok regions
type NgrokRegion = 'us' | 'eu' | 'ap' | 'au' | 'sa' | 'jp' | 'in';

// Validate and set region with type safety
const REGION = (process.env.NGROK_REGION || 'eu') as NgrokRegion;
// Show ngrok logs toggle (set to 'true' to see detailed ngrok logs)
const SHOW_NGROK_DEBUG = process.env.SHOW_NGROK_DEBUG === 'true';

async function startDevServer() {
  logger.info('Starting development server...');
  
  // Check if a server is already running on the port
  try {
    const testConnection = await fetch(`http://${HOST}:${PORT}`);
    logger.info('Dev server is already running, reusing existing server.');
    return;
  } catch (error) {
    // No server running, which is expected - we'll start one
  }
  
  // Display a more prominent separator for SvelteKit logs
  console.log('\n==================================================');
  console.log('              STARTING SVELTEKIT SERVER           ');
  console.log('==================================================\n');
  
  const devServer = spawn('bun', ['--bun', 'run', 'vite_dev'], {
    stdio: 'inherit', // This ensures SvelteKit logs show up in the console
    shell: true,
    env: { 
      ...process.env, 
      FORCE_COLOR: 'true',
      // Add any environment variables you want to pass to SvelteKit here
    }
  });
  
  // Handle dev server exit
  devServer.on('close', (code) => {
    if (code !== 0) {
      logger.error(`Dev server process exited with code ${code}`);
      process.exit(code || 1);
    }
  });
  
  // Give the dev server time to start and verify it's running
  return new Promise<void>((resolve, reject) => {
    // Increased wait time to ensure server is fully started
    setTimeout(() => {
      console.log('\n==================================================');
      console.log('             SVELTEKIT SERVER STARTED             ');
      console.log('==================================================\n');
      resolve();
    }, 8000);
  });
}

async function startNgrok() {
  try {
    logger.info(`Connecting ngrok to ${HOST}:${PORT}...`);
    
    // Verify server is accessible
    try {
      const response = await fetch(`http://${HOST}:${PORT}`);
      logger.info(`Server is accessible. Status: ${response.status}`);
    } catch (error) {
      logger.error(`Unable to connect to local server at http://${HOST}:${PORT}`);
      logger.error('This might mean your Vite dev server is not running or is using a different port.');
      logger.error('Please check your vite.config.js for the correct port configuration.');
      throw new Error('Local server not accessible');
    }
    
    // Check if authtoken is provided
    if (!NGROK_AUTHTOKEN) {
      logger.error('Ngrok authtoken is required. Please sign up at https://dashboard.ngrok.com/signup');
      logger.error('Then get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken');
      logger.error('You can set it in the script or run with: NGROK_AUTHTOKEN=your_token bun run expose');
      throw new Error('Missing ngrok authtoken');
    }

    // Set the authtoken
    await ngrok.authtoken(NGROK_AUTHTOKEN);
    
    // Initialize ngrok connection
    const url = await ngrok.connect({
      addr: `${HOST}:${PORT}`,
      region: REGION,
      onStatusChange: (status) => {
        logger.ngrok(`Status changed: ${status}`);
      },
      onLogEvent: (logEvent) => {
        // Only show error logs or all logs if debug is enabled
        if (logEvent.includes('error')) {
          logger.error(`Ngrok: ${logEvent}`);
        } else if (SHOW_NGROK_DEBUG) {
          logger.ngrok(logEvent);
        }
      }
    });
    
    console.log('\n==================================================');
    console.log('                NGROK TUNNEL ACTIVE                ');
    console.log('==================================================');
    logger.info('✅ Success! Your prayer times display is now available worldwide at:');
    logger.info(`🔗 ${url}`);
    logger.info('Press Ctrl+C to stop the server');
    
    return url;
  } catch (error) {
    logger.error('Failed to start ngrok:', error);
    process.exit(1);
  }
}

function printSetupInstructions() {
  logger.info('\n===== SETUP INSTRUCTIONS =====');
  logger.info('To use ngrok, you need to:');
  logger.info('1. Sign up at https://dashboard.ngrok.com/signup');
  logger.info('2. Get your auth token at https://dashboard.ngrok.com/get-started/your-authtoken');
  logger.info('3. Add your auth token to the .env file');
  logger.info('   or run with: NGROK_AUTHTOKEN=your_token bun run expose');
  logger.info('==============================\n');
}

async function main() {
  // Set up cleanup on exit
  process.on('SIGINT', async () => {
    console.log('\n==================================================');
    logger.info('Shutting down ngrok and server...');
    try {
      await ngrok.kill();
      logger.info('Ngrok tunnel closed successfully');
    } catch (error) {
      logger.error('Error shutting down ngrok:', error);
    }
    console.log('==================================================\n');
    process.exit(0);
  });
  
  // Check if authtoken is present
  if (!NGROK_AUTHTOKEN) {
    printSetupInstructions();
    process.exit(1);
  }
  
  try {
    await startDevServer();
    const url = await startNgrok();
    
    // Keep the process running
    logger.info('\nYour SvelteKit app is now exposed. Press Ctrl+C to stop.');
    logger.info('✅ Share the URL with anyone to access your app from anywhere!');
  } catch (error) {
    logger.error('Failed to expose app:', error);
    
    // If authentication error, print setup instructions
    if (error.toString().includes('authentication failed') || 
        error.toString().includes('authtoken')) {
      printSetupInstructions();
    }
    
    try {
      await ngrok.kill();
    } catch (killError) {
      // Ignore errors when killing ngrok
    }
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unexpected error:', error);
  process.exit(1);
});