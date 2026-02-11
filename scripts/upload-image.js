#!/usr/bin/env node

/**
 * Upload image to WeChat Official Account server
 * 
 * Usage:
 *   node upload-image.js --file "path/to/image.jpg"
 */

const fs = require('fs');
const https = require('https');
const FormData = require('form-data');

// Get access token first
const execSync = require('child_process').execSync;

try {
    const accessToken = execSync('node scripts/get-access-token.js', { 
        cwd: __dirname + '/..',
        encoding: 'utf8'
    }).trim();

    // Parse command line arguments
    const args = process.argv.slice(2);
    let imagePath = '';
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--file' && args[i + 1]) {
            imagePath = args[i + 1];
            break;
        }
    }

    if (!imagePath) {
        console.error('Error: --file parameter is required');
        console.error('Usage: node upload-image.js --file "path/to/image.jpg"');
        process.exit(1);
    }

    if (!fs.existsSync(imagePath)) {
        console.error('Error: Image file does not exist:', imagePath);
        process.exit(1);
    }

    const formData = new FormData();
    formData.append('buffer', fs.createReadStream(imagePath));

    const options = {
        hostname: 'api.weixin.qq.com',
        port: 443,
        path: `/cgi-bin/media/uploadimg?access_token=${accessToken}`,
        method: 'POST',
        headers: formData.getHeaders()
    };

    const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (response.url) {
                    console.log('Image uploaded successfully!');
                    console.log('Media ID:', response.media_id);
                    console.log('URL:', response.url);
                } else {
                    console.error('Error uploading image:', response);
                    process.exit(1);
                }
            } catch (e) {
                console.error('Failed to parse response:', data);
                process.exit(1);
            }
        });
    });

    req.on('error', (e) => {
        console.error('Request error:', e);
        process.exit(1);
    });

    formData.pipe(req);

} catch (error) {
    console.error('Error getting access token:', error.message);
    process.exit(1);
}