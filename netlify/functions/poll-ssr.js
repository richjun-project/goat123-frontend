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

  try {
    // Fetch poll data from Supabase
    const supabaseUrl = 'https://aydqwwhffuxbneyxyjeh.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZHF3d2hmZnV4Ym5leXh5amVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwNTA5NTQsImV4cCI6MjA1MTYyNjk1NH0.Ckz1bGCaOQzwqvgQo0OIXTPCJPhHLOUKaBXgAb4kZ7A';
    
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
    let votePercentages = { option_a: 50, option_b: 50 };
    
    if (pollResponse.ok) {
      const polls = await pollResponse.json();
      poll = polls[0];
      
      if (poll) {
        // Fetch vote counts
        const votesResponse = await fetch(
          `${supabaseUrl}/rest/v1/votes?poll_id=eq.${pollId}&select=option`,
          {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
          }
        );
        
        if (votesResponse.ok) {
          const votes = await votesResponse.json();
          const totalVotes = votes.length;
          
          if (totalVotes > 0) {
            const optionAVotes = votes.filter(v => v.option === 'option_a').length;
            const optionBVotes = votes.filter(v => v.option === 'option_b').length;
            
            votePercentages.option_a = Math.round((optionAVotes / totalVotes) * 100);
            votePercentages.option_b = Math.round((optionBVotes / totalVotes) * 100);
          }
        }
      }
    }

    // Prepare meta data
    const pollTitle = poll 
      ? `🔥 ${poll.option_a} vs ${poll.option_b} - THEGOAT123`
      : 'THEGOAT123 - 근본 투표 배틀';
    
    const pollDescription = poll
      ? `${poll.option_a} ${votePercentages.option_a}% vs ${poll.option_b} ${votePercentages.option_b}% | ${poll.category || '핫'} 투표 배틀`
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