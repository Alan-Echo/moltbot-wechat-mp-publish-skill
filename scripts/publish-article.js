#!/usr/bin/env node

/**
 * Publish WeChat Official Account article
 * 
 * Usage:
 *   node publish-article.js --media-id "MEDIA_ID"
 *   node publish-article.js --article "article.json"
 */

const fs = require('fs');
const https = require('https');

// Get access token first
const execSync = require('child_process').execSync;

try {
    const accessToken = execSync('node scripts/get-access-token.js', { 
        cwd: __dirname + '/..',
        encoding: 'utf8'
    }).trim();

    // Parse command line arguments
    const args = process.argv.slice(2);
    let mediaId = '';
    let articlePath = '';
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--media-id' && args[i + 1]) {
            mediaId = args[i + 1];
        } else if (args[i] === '--article' && args[i + 1]) {
            articlePath = args[i + 1];
        }
    }

    if (!mediaId && !articlePath) {
        console.error('Error: Either --media-id or --article parameter is required');
        console.error('Usage: node publish-article.js --media-id "MEDIA_ID"');
        console.error('   OR: node publish-article.js --article "article.json"');
        process.exit(1);
    }

    // If article path is provided, create the article first
    if (articlePath) {
        if (!fs.existsSync(articlePath)) {
            console.error('Error: Article file does not exist:', articlePath);
            process.exit(1);
        }
        
        const articleData = JSON.parse(fs.readFileSync(articlePath, 'utf8'));
        if (!articleData.title || !articleData.content) {
            console.error('Error: Article must have title and content fields');
            process.exit(1);
        }
        
        // Create article draft first
        const createResult = execSync(`node scripts/create-article.js --article "${articlePath}"`, {
            cwd: __dirname + '/..',
            encoding: 'utf8'
        });
        
        // Extract media_id from create result
        const mediaIdMatch = createResult.match(/Media ID:\s*(\w+)/);
        if (mediaIdMatch) {
            mediaId = mediaIdMatch[1];
            console.log('Using created media_id:', mediaId);
        } else {
            console.error('Failed to extract media_id from create result');
            process.exit(1);
        }
    }

    // Prepare mass send data
    const publishData = {
        filter: {
            is_to_all: true,
            tag_id: ""
        },
        mpnews: {
            media_id: mediaId
        },
        msgtype: "mpnews"
    };

    const postData = JSON.stringify(publishData);

    const options = {
        hostname: 'api.weixin.qq.com',
        port: 443,
        path: `/cgi-bin/message/mass/sendall?access_token=${accessToken}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (response.msg_id) {
                    console.log('Article published successfully!');
                    console.log('Message ID:', response.msg_id);
                    console.log('Note: For subscription accounts, this will be sent immediately.');
                } else {
                    console.error('Error publishing article:', response);
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

    req.write(postData);
    req.end();

} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}