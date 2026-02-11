---
name: wechat-official-account
description: Publish articles to WeChat Official Account (subscription account). Use when you need to publish pre-written content to a WeChat subscription account, including handling images, formatting, and the complete publishing workflow.
---

# WeChat Official Account Publishing Skill

This skill enables publishing articles to WeChat Official Account (subscription account) through the official API.

## Prerequisites

Before using this skill, you need to:

1. **WeChat Official Account**: Have an active subscription account with publishing permissions
2. **Developer Credentials**: 
   - AppID (from your Official Account settings)
   - AppSecret (from your Official Account settings)
3. **API Permissions**: Ensure your account has the necessary API permissions for:
   - Material management (永久素材管理)
   - Mass messaging (群发消息)

## Required Configuration

Store your WeChat credentials securely as environment variables:

```bash
export WECHAT_APP_ID="your-app-id"
export WECHAT_APP_SECRET="your-app-secret"
```

## Article Format Requirements

### Input Structure
Articles should be provided in the following JSON format:

```json
{
  "title": "Article title",
  "author": "Author name (optional)",
  "digest": "Short summary (optional, max 120 characters)",
  "content": "HTML formatted article content",
  "content_source_url": "Original source URL (optional)",
  "thumb_media_id": "Media ID of cover image (optional)",
  "need_open_comment": 1,
  "only_fans_can_comment": 1
}
```

### Content Guidelines
- **HTML Support**: Limited HTML tags are supported (p, div, span, img, a, strong, em, etc.)
- **Images**: All images must be uploaded to WeChat servers first and referenced by media_id
- **Cover Image**: Square aspect ratio (recommended 900x500 pixels)
- **Content Length**: No strict limit, but consider mobile reading experience

## Usage Workflow

### 1. Upload Images (if needed)
If your article contains images, upload them first:

```bash
node scripts/upload-image.js --file "path/to/image.jpg"
```

### 2. Create Article Draft
Create a permanent material draft:

```bash
node scripts/create-article.js --article "article.json"
```

### 3. Publish Article
Publish the article immediately or schedule it:

```bash
# Publish immediately
node scripts/publish-article.js --media-id "MEDIA_ID"

# Or publish the draft created in step 2
node scripts/publish-article.js --article "article.json"
```

## API Endpoints Used

1. **Get Access Token**: `GET https://api.weixin.qq.com/cgi-bin/token`
2. **Upload Image**: `POST https://api.weixin.qq.com/cgi-bin/media/uploadimg`
3. **Add News Material**: `POST https://api.weixin.qq.com/cgi-bin/material/add_news`
4. **Mass Send**: `POST https://api.weixin.qq.com/cgi-bin/message/mass/sendall`

## Rate Limits & Restrictions

- **Access Token**: Valid for 2 hours, refresh as needed
- **Image Upload**: Max 2MB per image, JPG/PNG formats
- **Mass Messaging**: 
  - Subscription accounts: 1 message per day (can include multiple articles)
  - Each message can contain up to 8 articles
- **API Calls**: Follow WeChat's general API rate limits

## Error Handling

Common error codes:
- **40001**: Invalid credential (check AppID/AppSecret)
- **40014**: Invalid access token (refresh token)
- **42001**: Access token expired (refresh token)
- **45009**: API daily limit reached
- **61401**: Article content too long
- **61501**: Invalid media_id

## Security Considerations

- Never expose AppID/AppSecret in client-side code
- Use HTTPS for all API calls
- Validate and sanitize article content before publishing
- Implement proper error handling to avoid exposing sensitive information

## Testing

Use WeChat's sandbox environment or test with a small audience first. You can also use the preview feature to test articles before full publication.

## References

- [WeChat Official Account Documentation](https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html)
- [Material Management API](https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/New_temporary_materials.html)
- [Mass Messaging API](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Batch_Sends_and_Originality_Checks.html)