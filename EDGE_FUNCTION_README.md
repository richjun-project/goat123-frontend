# Netlify Edge Functions for Dynamic OG Tags

## Overview
This project uses Netlify Edge Functions to dynamically generate Open Graph meta tags for poll sharing. When users share a poll link on social media (KakaoTalk, Facebook, Twitter, etc.), the preview will show the actual poll details instead of generic site information.

## How It Works
1. When a request comes for `/poll/[poll-id]`, the Edge Function intercepts it
2. The function fetches the poll data from Supabase
3. It modifies the HTML meta tags to include:
   - Poll title: "🔥 [Option A] vs [Option B] - THEGOAT123"
   - Poll description: "[Option A] X% vs [Option B] Y% | [Category] 투표 배틀"
   - Poll-specific URL

## Files
- `netlify/edge-functions/og-rewriter.js` - The Edge Function that modifies meta tags
- `netlify.toml` - Configuration that registers the Edge Function

## Local Testing Limitations
⚠️ **Note**: Edge Functions may have issues fetching external data (Supabase) in local development due to Deno runtime restrictions. The function includes fallback handling for this scenario.

To test locally:
```bash
netlify dev
```

Then visit: http://localhost:8888/poll/[poll-id]

## Production Deployment
The Edge Function will work correctly in production on Netlify. When you deploy:
1. Push your code to GitHub
2. Netlify will automatically detect and deploy the Edge Function
3. Poll links will show dynamic previews in social media shares

## Debugging
- Check Edge Function logs in Netlify dashboard under Functions > Edge Functions
- The function includes error handling and will fall back to original HTML if fetching fails
- Timeout is set to 5 seconds to prevent hanging

## Example Preview
When sharing a poll link like `https://thegoat123.com/poll/abc-123`:
- **Before**: "THEGOAT123 - 근본 투표 배틀"
- **After**: "🔥 치킨 vs 피자 - THEGOAT123" with vote percentages