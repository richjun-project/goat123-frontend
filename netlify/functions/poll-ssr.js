exports.handler = async (event, context) => {
  // Extract poll ID from path or query parameters
  // Path will be like /.netlify/functions/poll-ssr/5c6fe4a9-e8d1-484f-8f83-f2fdc73b8dbc
  const pathParts = event.path.split('/');
  const pollId = pathParts[pathParts.length - 1] || event.queryStringParameters?.id;
  
  if (!pollId || pollId === 'poll-ssr') {
    return {
      statusCode: 302,
      headers: {
        Location: '/'
      }
    };
  }

  // Check if this is a bot/crawler request
  const userAgent = event.headers['user-agent'] || '';
  
  // 카카오톡 및 기타 소셜 미디어 크롤러 감지
  const isSocialBot = userAgent.includes('facebookexternalhit') || 
                      userAgent.includes('Kakaotalk-scrap') || 
                      userAgent.includes('kakaotalk-scrap') ||
                      userAgent.includes('KHTML, like Gecko) Version/');
                      
  const isOtherBot = /bot|crawler|spider|crawling|twitter|telegram|discord|slack|linkedIn|whatsapp/i.test(userAgent);
  
  // 실제 사용자 브라우저 감지 (카카오톡 인앱 브라우저 포함)
  const isRealBrowser = userAgent.includes('Chrome/') || 
                        userAgent.includes('Safari/') || 
                        userAgent.includes('Firefox/') ||
                        userAgent.includes('KAKAOTALK');
  
  // 봇인지 판단: 크롤러이면서 실제 브라우저가 아닌 경우만 봇으로 처리
  const isBot = (isSocialBot || isOtherBot) && !isRealBrowser;
  
  console.log(`[poll-ssr] User-Agent: ${userAgent}, isBot: ${isBot}`);
  
  // If not a bot, use 302 redirect directly
  if (!isBot) {
    // Direct 302 redirect for non-bot users (including KakaoTalk in-app browser)
    return {
      statusCode: 302,
      headers: {
        'Location': `/poll/${pollId}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: ''
    };
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
  </head>
  <body>
    <div id="root">
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
        <div style="text-align: center;">
          <h1>${pollTitle}</h1>
          <p>${pollDescription}</p>
          <a href="${pollUrl}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #8B5CF6; color: white; text-decoration: none; border-radius: 5px;">투표 참여하기</a>
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
    <meta property="og:title" content="THEGOAT123 - 근본 투표 배틀" />
    <meta property="og:description" content="MZ세대를 위한 실시간 투표 플랫폼" />
    <meta property="og:image" content="https://thegoat123.com/og-image.png" />
  </head>
  <body>
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
      <div style="text-align: center;">
        <h1>THEGOAT123</h1>
        <p>근본 투표 배틀</p>
        <a href="https://thegoat123.com/poll/${pollId}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #8B5CF6; color: white; text-decoration: none; border-radius: 5px;">투표 보러가기</a>
      </div>
    </div>
  </body>
</html>`
    };
  }
};