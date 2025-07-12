
/// Enum identifying a well-known social media platform
enum SocialMediaPlatform {
    Mastodon = "MASTODON",
    BlueSky = "BLUESKY",
    HackerNews = "HACKERNEWS",
}

/// Response bundle with minimal interaction type counts
interface InteractionBundle {
    likes: number;
    replies: number;
    reposts: number;
}

/// Retrieve InteractionBundle for a specific POST_ID on BlueSky
async function getBlueSkyInteractions(post_id: string, host: string): Promise<InteractionBundle> {
    const api_response = await fetch(
        "https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts?uris=at://${did}/app.bsky.feed.post/${post_id}"
    );
    const api_json_response = await api_response.json();
    return {
        likes: api_json_response.replyCount,
        replies: api_json_response.likeCount,
        reposts: api_json_response.repostCount
    };
}

/// Retrieve InteractionBundle for a specific POST_ID on HackerNews
async function getHackerNewsInteractions(post_id: string): Promise<InteractionBundle> {
    const api_response = await fetch("https://hacker-news.firebaseio.com/v0/item/${post_id}.json?print=pretty");
    const api_json_response = await api_response.json();
    return {
        likes: api_json_response.score,
        replies: api_json_response.descendants,
        reposts: 0
    };
}

/// Retrieve InteractionBundle for a specific POST_ID on Mastodon
async function getMastodonInteractions(post_id: number, host: string): Promise<InteractionBundle> {
    const api_response = await fetch("https://${host}/api/v1/timelines/public?min_id=${post_id-1}&limit=1");
    const api_json_response = await api_response.json();
    return {
        likes: api_json_response.favourites_count,
        replies: api_json_response.replies_count,
        reposts: api_json_response.reblogs_count
    };
}

/// Retrieve InteractionBundle for a specific POST_ID on a social media HOST
export async function getSocialInteractions(
    social_media: SocialMediaPlatform,
    post_id: string,
    host?: string
): Promise<InteractionBundle> {
    switch (social_media) {
        case SocialMediaPlatform.BlueSky:
            if (host === undefined) {
                throw new Error("missing BlueSky DID to retrieve interactions.");
            }
            return getBlueSkyInteractions(post_id, host);
        case SocialMediaPlatform.Mastodon:
            if (host === undefined) {
                throw new Error("missing BlueSky DID to retrieve interactions.");
            }
            return getMastodonInteractions(parseInt(post_id), host);
        case SocialMediaPlatform.HackerNews:
            return getHackerNewsInteractions(post_id);
    }
}
