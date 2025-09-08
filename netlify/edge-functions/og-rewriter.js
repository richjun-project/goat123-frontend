export default async (request, context) => {
  const url = new URL(request.url);
  
  // Only process poll detail pages
  const pollMatch = url.pathname.match(/^\/poll\/([a-f0-9-]+)$/);
  if (!pollMatch) {
    return;
  }

  const pollId = pollMatch[1];
  
  // Get the original response
  const response = await context.next();
  
  // Only modify HTML responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('text/html')) {
    return response;
  }
  
  try {
    // Clone the response so we can read it
    const clonedResponse = response.clone();
    const html = await clonedResponse.text();
    
    // Fetch poll data from Supabase
    const supabaseUrl = 'https://aydqwwhffuxbneyxyjeh.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZHF3d2hmZnV4Ym5leXh5amVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwNTA5NTQsImV4cCI6MjA1MTYyNjk1NH0.Ckz1bGCaOQzwqvgQo0OIXTPCJPhHLOUKaBXgAb4kZ7A';
    
    // Use a timeout for the fetch to avoid hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    let poll = null;
    let votePercentages = { option_a: 50, option_b: 50 };
    
    try {
      const pollResponse = await fetch(
        `${supabaseUrl}/rest/v1/polls?id=eq.${pollId}&select=*`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeout);
      
      if (pollResponse.ok) {
        const polls = await pollResponse.json();
        poll = polls[0];
        
        if (poll) {
          // Try to fetch vote data
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
    } catch (fetchError) {
      console.log('Could not fetch poll data, using fallback');
      // Continue with null poll
    }
    
    if (!poll) {
      // If we couldn't fetch the poll, return the original response
      return response;
    }

    // Prepare dynamic meta tags
    const pollTitle = `🔥 ${poll.option_a} vs ${poll.option_b} - THEGOAT123`;
    const pollDescription = `${poll.option_a} ${votePercentages.option_a}% vs ${poll.option_b} ${votePercentages.option_b}% | ${poll.category || '핫'} 투표 배틀`;
    const pollUrl = `https://thegoat123.com/poll/${pollId}`;

    // Replace meta tags
    const modifiedHtml = html
      // Update title
      .replace(
        /<title>.*?<\/title>/,
        `<title>${pollTitle}</title>`
      )
      // Update meta description
      .replace(
        /<meta name="description" content=".*?".*?\/>/,
        `<meta name="description" content="${pollDescription}" />`
      )
      // Update Open Graph tags
      .replace(
        /<meta property="og:title" content=".*?".*?\/>/,
        `<meta property="og:title" content="${pollTitle}" />`
      )
      .replace(
        /<meta property="og:description" content=".*?".*?\/>/,
        `<meta property="og:description" content="${pollDescription}" />`
      )
      .replace(
        /<meta property="og:url" content=".*?".*?\/>/,
        `<meta property="og:url" content="${pollUrl}" />`
      )
      // Update Kakao tags
      .replace(
        /<meta property="kakao:title" content=".*?".*?\/>/,
        `<meta property="kakao:title" content="${pollTitle}" />`
      )
      .replace(
        /<meta property="kakao:description" content=".*?".*?\/>/,
        `<meta property="kakao:description" content="${pollDescription}" />`
      )
      // Update Twitter tags
      .replace(
        /<meta name="twitter:title" content=".*?".*?\/>/,
        `<meta name="twitter:title" content="${pollTitle}" />`
      )
      .replace(
        /<meta name="twitter:description" content=".*?".*?\/>/,
        `<meta name="twitter:description" content="${pollDescription}" />`
      );

    return new Response(modifiedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Error in og-rewriter edge function:', error);
    // Return the original response if there's an error
    return response;
  }
};

export const config = {
  path: "/poll/*",
};