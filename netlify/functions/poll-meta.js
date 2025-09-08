exports.handler = async (event, context) => {
  // Extract poll ID from query parameters
  const pollId = event.queryStringParameters?.id;
  
  if (!pollId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Poll ID is required' })
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

    if (!pollResponse.ok) {
      throw new Error(`Failed to fetch poll: ${pollResponse.status}`);
    }

    const polls = await pollResponse.json();
    const poll = polls[0];

    if (!poll) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Poll not found' })
      };
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

    // Prepare meta data
    const pollTitle = `🔥 ${poll.option_a} vs ${poll.option_b} - THEGOAT123`;
    const pollDescription = `${poll.option_a} ${votePercentages.option_a}% vs ${poll.option_b} ${votePercentages.option_b}% | ${poll.category || '핫'} 투표 배틀`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      },
      body: JSON.stringify({
        title: pollTitle,
        description: pollDescription,
        option_a: poll.option_a,
        option_b: poll.option_b,
        percentages: votePercentages,
        category: poll.category
      })
    };
  } catch (error) {
    console.error('Error fetching poll data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch poll data' })
    };
  }
};