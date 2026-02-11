#!/usr/bin/env node

/**
 * Create WeChat Official Account article draft
 * 
 * Usage:
 *   node create-article.js --article "article.json"
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
    let articlePath = '';
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--article' && args[i + 1]) {
            articlePath = args[i + 1];
            break;
        }
    }

    if (!articlePath) {
        console.error('Error: --article parameter is required');
        console.error('Usage: node create-article.js --article "article.json"');
        process.exit(1);
    }

    if (!fs.existsSync(articlePath)) {
        console.error('Error: Article file does not exist:', articlePath);
        process.exit(1);
    }

    const articleData = JSON.parse(fs.readFileSync(articlePath, 'utf8'));
    
    // Validate required fields
    if (!articleData.title || !articleData.content) {
        console.error('Error: Article must have title and content fields');
        process.exit(1);
    }

    // Prepare news article data
    const newsData = {
        articles: [{
            title: articleData.title,
            thumb_media_id: articleData.thumb_media_id,
            author: articleData.author || '',
            digest: articleData.digest || '',
            show_cover_pic: articleData.show_cover_pic !== undefined ? articleData.show_cover_pic : 1,
            content: articleData.content,
            content_source_url: articleData.content_source_url || '',
            need_open_comment: articleData.need_open_comment || 0,
            only_fans_can_comment: articleData.only_fans_can_comment || 0
        }]
    };

    const postData = JSON.stringify(newsData);

    const options = {
        hostname: 'api.weixin.qq.com',
        port: 443,
        path: `/cgi-bin/material/add_news?access_token=${accessToken}`,
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
                if (response.media_id) {
                    console.log('Article draft created successfully!');
                    console.log('Media ID:', response.media_id);
                    console.log('Use this media_id to publish the article.');
                } else {
                    console.error('Error creating article:', response);
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