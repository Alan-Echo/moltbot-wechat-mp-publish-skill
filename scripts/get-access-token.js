#!/usr/bin/env node

/**
 * Get WeChat Official Account Access Token
 * 
 * Usage:
 *   node get-access-token.js
 */

const https = require('https');
const querystring = require('querystring');

const APP_ID = process.env.WECHAT_APP_ID;
const APP_SECRET = process.env.WECHAT_APP_SECRET;

if (!APP_ID || !APP_SECRET) {
    console.error('Error: WECHAT_APP_ID and WECHAT_APP_SECRET environment variables are required');
    process.exit(1);
}

const params = querystring.stringify({
    grant_type: 'client_credential',
    appid: APP_ID,
    secret: APP_SECRET
});

const options = {
    hostname: 'api.weixin.qq.com',
    port: 443,
    path: `/cgi-bin/token?${params}`,
    method: 'GET'
};

const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.access_token) {
                console.log(response.access_token);
            } else {
                console.error('Error getting access token:', response);
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

req.end();