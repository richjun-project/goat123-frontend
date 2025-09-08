export default async (request, context) => {
  const url = new URL(request.url);
  
  // Only process poll detail pages
  if (!url.pathname.startsWith('/poll/')) {
    return;
  }

  const pollId = url.pathname.split('/')[2];
  if (!pollId) {
    return;
  }

  // Get the original response
  const response = await context.next();
  
  // Only modify HTML responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('text/html')) {
    return;
  }
  
  try {
    const html = await response.text();
    
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

    if (!pollResponse.ok) {
      console.log('Failed to fetch poll:', pollResponse.status);
      return new Response(html, response);
    }

    const polls = await pollResponse.json();
    const poll = polls[0];

    if (!poll) {
      console.log('Poll not found:', pollId);
      return new Response(html, response);
    }

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

    let votePercentages = { option_a: 50, option_b: 50 };
    
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

    // Prepare dynamic meta tags
    const pollTitle = `🔥 ${poll.option_a} vs ${poll.option_b} - THEGOAT123`;
    const pollDescription = `${poll.option_a} ${votePercentages.option_a}% vs ${poll.option_b} ${votePercentages.option_b}% | ${poll.category || '핫'} 투표 배틀`;
    const pollUrl = `https://thegoat123.com/poll/${pollId}`;

    // Replace meta tags
    let modifiedHtml = html;
    
    // Update title
    modifiedHtml = modifiedHtml.replace(
      /<title>.*?<\/title>/,
      `<title>${pollTitle}</title>`
    );
    
    // Update meta description
    modifiedHtml = modifiedHtml.replace(
      /<meta name="description" content=".*?".*?\/>/,
      `<meta name="description" content="${pollDescription}" />`
    );
    
    // Update Open Graph tags
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:title" content=".*?".*?\/>/,
      `<meta property="og:title" content="${pollTitle}" />`
    );
    
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:description" content=".*?".*?\/>/,
      `<meta property="og:description" content="${pollDescription}" />`
    );
    
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:url" content=".*?".*?\/>/,
      `<meta property="og:url" content="${pollUrl}" />`
    );
    
    // Update Kakao tags
    modifiedHtml = modifiedHtml.replace(
      /<meta property="kakao:title" content=".*?".*?\/>/,
      `<meta property="kakao:title" content="${pollTitle}" />`
    );
    
    modifiedHtml = modifiedHtml.replace(
      /<meta property="kakao:description" content=".*?".*?\/>/,
      `<meta property="kakao:description" content="${pollDescription}" />`
    );
    
    // Update Twitter tags
    modifiedHtml = modifiedHtml.replace(
      /<meta name="twitter:title" content=".*?".*?\/>/,
      `<meta name="twitter:title" content="${pollTitle}" />`
    );
    
    modifiedHtml = modifiedHtml.replace(
      /<meta name="twitter:description" content=".*?".*?\/>/,
      `<meta name="twitter:description" content="${pollDescription}" />`
    );

    return new Response(modifiedHtml, response);
  } catch (error) {
    console.error('Error in og-rewriter:', error);
    return;
  }
};

export const config = {
  path: "/poll/*",
};