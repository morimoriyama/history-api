const { WebClient } = require('@slack/client');

// An access token (from your Slack app or custom integration - xoxp, or xoxb)
const token = 'xoxp-2595056677-145356002708-450459476340-1a5f801d57813fb04f4806f693c74b57';

const web = new WebClient(token);

(async () => {
  // See: https://api.slack.com/methods/conversations.list
  const res = await web.conversations.list({
    exclude_archived: true,
    types: 'public_channel',
    // Only get first 100 items
    limit: 100,
  });

  // `res.channels` is an array of channel info objects
  const _res = await web.emoji.list({});
  const __res = await web.users.list({});
})();