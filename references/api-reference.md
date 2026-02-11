# WeChat Official Account API Reference

## 1. Get Access Token

**Endpoint**: `GET https://api.weixin.qq.com/cgi-bin/token`

**Parameters**:
- `grant_type`: `client_credential`
- `appid`: Your AppID
- `secret`: Your AppSecret

**Response**:
```json
{
  "access_token": "ACCESS_TOKEN",
  "expires_in": 7200
}
```

## 2. Upload Image

**Endpoint**: `POST https://api.weixin.qq.com/cgi-bin/media/uploadimg`

**Headers**:
- `Content-Type: multipart/form-data`

**Parameters**:
- `access_token`: Valid access token
- File upload in form data with field name `buffer`

**Response**:
```json
{
  "url": "http://mmbiz.qpic.cn/mmbiz/xxx",
  "media_id": "MEDIA_ID"
}
```

## 3. Add News Material

**Endpoint**: `POST https://api.weixin.qq.com/cgi-bin/material/add_news`

**Headers**:
- `Content-Type: application/json`

**Body**:
```json
{
  "articles": [{
    "title": "Title",
    "thumb_media_id": "MEDIA_ID",
    "author": "Author",
    "digest": "Digest",
    "show_cover_pic": 1,
    "content": "Content HTML",
    "content_source_url": "URL",
    "need_open_comment": 1,
    "only_fans_can_comment": 1
  }]
}
```

**Response**:
```json
{
  "media_id": "MEDIA_ID"
}
```

## 4. Mass Send News

**Endpoint**: `POST https://api.weixin.qq.com/cgi-bin/message/mass/sendall`

**Headers**:
- `Content-Type: application/json`

**Body**:
```json
{
  "filter": {
    "is_to_all": true,
    "tag_id": ""
  },
  "mpnews": {
    "media_id": "MEDIA_ID"
  },
  "msgtype": "mpnews"
}
```

**Response**:
```json
{
  "msg_id": 123456789,
  "msg_data_id": 123456789
}
```

## Important Notes for Subscription Accounts

1. **Publishing Frequency**: Subscription accounts can only send 1 mass message per day
2. **Article Limit**: Each mass message can contain up to 8 articles
3. **Immediate Delivery**: Articles are sent immediately (no scheduling for subscription accounts)
4. **Preview Option**: Consider using preview APIs before full publication
5. **Content Review**: All content goes through WeChat's content review system

## Error Codes

- **40001**: Invalid credential
- **40014**: Invalid access token  
- **42001**: Access token expired
- **45009**: API daily limit reached
- **61401**: Article content too long
- **61501**: Invalid media_id
- **61517**: Too many articles in one message (max 8)

## Best Practices

1. **Token Management**: Cache access tokens and refresh before expiration
2. **Image Optimization**: Compress images before upload (max 2MB)
3. **Content Validation**: Validate HTML content before submission
4. **Error Handling**: Implement robust error handling and retry logic
5. **Rate Limiting**: Respect API rate limits to avoid being blocked