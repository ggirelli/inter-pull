/* inter-pull v1.0.0
 * License: MIT
 * Author: Gabriele Girelli */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/// Enum identifying a well-known social media platform
var SocialMediaPlatform;
(function (SocialMediaPlatform) {
    SocialMediaPlatform["Mastodon"] = "MASTODON";
    SocialMediaPlatform["BlueSky"] = "BLUESKY";
    SocialMediaPlatform["HackerNews"] = "HACKERNEWS";
})(SocialMediaPlatform || (SocialMediaPlatform = {}));
/// Retrieve InteractionBundle for a specific POST_ID on BlueSky
function getBlueSkyInteractions(post_id, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const api_response = yield fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts?uris=at://${host}/app.bsky.feed.post/${post_id}`);
        const api_json_response = yield api_response.json();
        return {
            likes: api_json_response.posts[0].replyCount,
            replies: api_json_response.posts[0].likeCount,
            reposts: api_json_response.posts[0].repostCount
        };
    });
}
/// Retrieve InteractionBundle for a specific POST_ID on HackerNews
function getHackerNewsInteractions(post_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const api_response = yield fetch(`https://hacker-news.firebaseio.com/v0/item/${post_id}.json?print=pretty`);
        const api_json_response = yield api_response.json();
        return {
            likes: api_json_response.score,
            replies: api_json_response.descendants,
            reposts: 0
        };
    });
}
/// Retrieve InteractionBundle for a specific POST_ID on Mastodon
function getMastodonInteractions(post_id, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const api_response = yield fetch(`https://${host}/api/v1/timelines/public?min_id=${post_id}&limit=1`);
        const api_json_response = yield api_response.json();
        return {
            likes: api_json_response[0].favourites_count,
            replies: api_json_response[0].replies_count,
            reposts: api_json_response[0].reblogs_count
        };
    });
}
/// Retrieve InteractionBundle for a specific POST_ID on a social media HOST
function getSocialInteractions(social_media, post_id, host) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (social_media) {
            case SocialMediaPlatform.BlueSky:
                if (host === undefined) {
                    throw new Error("missing BlueSky DID to retrieve interactions.");
                }
                return getBlueSkyInteractions(post_id, host);
            case SocialMediaPlatform.Mastodon:
                if (host === undefined) {
                    throw new Error("missing Mastodon host to retrieve interactions.");
                }
                return getMastodonInteractions(
                // NOTE: we use BigInt due to JavaScript limited precision
                (BigInt(post_id) - BigInt(1)).toString(), host);
            case SocialMediaPlatform.HackerNews:
                return getHackerNewsInteractions(post_id);
        }
    });
}
//# sourceMappingURL=inter-pull.js.map