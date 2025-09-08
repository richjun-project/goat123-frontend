exports.handler = async (event, context) => {
  // Extract poll ID from query parameters
  const pollId = event.queryStringParameters?.id;
  
  if (!pollId) {
    return {
      statusCode: 302,
      headers: {
        Location: '/'
      }
    };
  }

  // Check if this is a bot/crawler request
  const userAgent = event.headers['user-agent'] || '';
  const isBot = /bot|crawler|spider|crawling|facebook|twitter|kakao|telegram|discord|slack|linkedIn|whatsapp/i.test(userAgent);
  
  console.log(`[poll-ssr] User-Agent: ${userAgent}, isBot: ${isBot}`);
  
  // If not a bot, fetch and return the original index.html
  if (!isBot) {
    try {
      // Fetch the index.html from the site
      const response = await fetch('https://thegoat123.com/index.html');
      const html = await response.text();
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        },
        body: html
      };
    } catch (error) {
      console.error('Error fetching index.html:', error);
      // Fallback to a basic redirect
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        },
        body: `<!doctype html><html><head><script>window.location.href='/';</script></head></html>`
      };
    }
  }

  try {
    // Fetch poll data from Supabase
    const supabaseUrl = 'https://aktukgzzplggrivtnytt.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdHVrZ3p6cGxnZ3JpdnRueXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDI4NTcsImV4cCI6MjA3MTI3ODg1N30.Tjsim0Ih8iv-XdAiwDQUDHNuU77zsg6uw_XfyKKG67A';
    
    const pollResponse = await fetch(
      `${supabaseUrl}/rest/v1/polls?id=eq.${pollId}&select=*`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      }
    );

    let poll = null;
    let pollOptions = [];
    let topOptions = [];
    
    if (pollResponse.ok) {
      const polls = await pollResponse.json();
      poll = polls[0];
      console.log(`[poll-ssr] Fetched poll:`, poll ? poll.title : 'not found');
      
      if (poll) {
        // Fetch poll options
        const optionsResponse = await fetch(
          `${supabaseUrl}/rest/v1/poll_options?poll_id=eq.${pollId}&order=vote_count.desc`,
          {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
          }
        );
        
        if (optionsResponse.ok) {
          pollOptions = await optionsResponse.json();
          
          // Get top 2 options for the title
          if (pollOptions.length >= 2) {
            topOptions = pollOptions.slice(0, 2);
          } else if (pollOptions.length === 1) {
            topOptions = [pollOptions[0], { option_text: '??', vote_count: 0 }];
          }
        }
      }
    } else {
      console.log(`[poll-ssr] Failed to fetch poll: ${pollResponse.status} ${pollResponse.statusText}`);
    }

    // Prepare meta data
    const pollTitle = poll && topOptions.length >= 2
      ? `🔥 ${poll.title || `${topOptions[0].option_text} vs ${topOptions[1].option_text}`} - THEGOAT123`
      : 'THEGOAT123 - 근본 투표 배틀';
    
    const pollDescription = poll && topOptions.length >= 2
      ? `${topOptions[0].option_text} ${topOptions[0].vote_count}표 vs ${topOptions[1].option_text} ${topOptions[1].vote_count}표 | ${poll.category || '핫'} 투표 배틀`
      : 'MZ세대를 위한 실시간 투표 플랫폼';
    
    const pollUrl = `https://thegoat123.com/poll/${pollId}`;

    // Generate HTML with dynamic meta tags
    const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/src/assets/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
    <meta name="theme-color" content="#8B5CF6" />
    <meta name="description" content="${pollDescription}" />
    
    <!-- PWA -->
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/src/assets/logo.png" />
    
    <!-- Open Graph / 소셜 미디어 -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${pollTitle}" />
    <meta property="og:description" content="${pollDescription}" />
    <meta property="og:image" content="https://thegoat123.com/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${pollUrl}" />
    
    <!-- 카카오톡 공유 -->
    <meta property="kakao:title" content="${pollTitle}" />
    <meta property="kakao:description" content="${pollDescription}" />
    <meta property="kakao:image" content="https://thegoat123.com/og-image.png" />
    
    <!-- 트위터 카드 -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pollTitle}" />
    <meta name="twitter:description" content="${pollDescription}" />
    <meta name="twitter:image" content="https://thegoat123.com/og-image.png" />
    
    <title>${pollTitle}</title>
    <script>
      // Redirect to the actual app
      window.location.href = '${pollUrl}';
    </script>
  </head>
  <body>
    <div id="root">
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
        <div style="text-align: center;">
          <h1>${pollTitle}</h1>
          <p>${pollDescription}</p>
          <p>페이지로 이동 중...</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      },
      body: html
    };
  } catch (error) {
    console.error('Error in poll-ssr:', error);
    
    // Return basic HTML on error
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      },
      body: `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>THEGOAT123 - 근본 투표 배틀</title>
    <script>window.location.href = 'https://thegoat123.com/poll/${pollId}';</script>
  </head>
  <body>페이지로 이동 중...</body>
</html>`
    };
  }
};