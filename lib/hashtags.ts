// Curated, static hashtag sets by niche. No external API/scraping — these are
// evergreen, widely-used tags that don't require live trend data to be useful.

export interface HashtagNiche {
  key: string
  label: string
  keywords: string[] // words that should match this niche
  tags: string[]
}

export const HASHTAG_NICHES: HashtagNiche[] = [
  {
    key: 'travel', label: 'Travel',
    keywords: ['travel', 'trip', 'vacation', 'wanderlust', 'tourism', 'backpacking', 'holiday'],
    tags: ['travel', 'travelgram', 'wanderlust', 'instatravel', 'travelphotography', 'traveling', 'trip', 'vacation', 'adventure', 'explore', 'travelblogger', 'traveltheworld', 'backpacking', 'passportready', 'wanderer', 'exploremore', 'travelingram', 'roadtrip', 'traveladdict', 'traveler'],
  },
  {
    key: 'food', label: 'Food & Cooking',
    keywords: ['food', 'cooking', 'recipe', 'chef', 'kitchen', 'baking', 'foodie', 'meal'],
    tags: ['food', 'foodie', 'foodporn', 'foodphotography', 'instafood', 'foodstagram', 'yummy', 'delicious', 'homemade', 'cooking', 'recipe', 'foodlover', 'tasty', 'chef', 'baking', 'foodgasm', 'eeeeeats', 'foodblogger', 'healthyfood', 'dinner'],
  },
  {
    key: 'fitness', label: 'Fitness & Gym',
    keywords: ['fitness', 'gym', 'workout', 'exercise', 'training', 'bodybuilding', 'crossfit'],
    tags: ['fitness', 'gym', 'workout', 'fitnessmotivation', 'training', 'fit', 'health', 'bodybuilding', 'fitfam', 'gymlife', 'exercise', 'motivation', 'muscle', 'strong', 'crossfit', 'personaltrainer', 'gains', 'healthylifestyle', 'strength', 'sweat'],
  },
  {
    key: 'fashion', label: 'Fashion & Style',
    keywords: ['fashion', 'style', 'outfit', 'clothing', 'ootd', 'streetwear', 'apparel'],
    tags: ['fashion', 'style', 'ootd', 'fashionista', 'streetstyle', 'outfitoftheday', 'fashionblogger', 'instafashion', 'styleinspo', 'trendy', 'fashionstyle', 'lookbook', 'clothing', 'fashionable', 'model', 'streetwear', 'fashiongram', 'stylish', 'shopping', 'wiwt'],
  },
  {
    key: 'beauty', label: 'Beauty & Makeup',
    keywords: ['beauty', 'makeup', 'skincare', 'cosmetics', 'mua', 'lipstick'],
    tags: ['beauty', 'makeup', 'skincare', 'makeupartist', 'beautiful', 'cosmetics', 'mua', 'makeuplover', 'beautyblogger', 'glam', 'instabeauty', 'lipstick', 'skincareroutine', 'glowingskin', 'makeuptutorial', 'beautycare', 'selfcare', 'crueltyfree', 'beautyproducts', 'eyeshadow'],
  },
  {
    key: 'photography', label: 'Photography',
    keywords: ['photography', 'photo', 'photographer', 'camera', 'portrait', 'shot'],
    tags: ['photography', 'photooftheday', 'photographer', 'photo', 'picoftheday', 'instaphoto', 'portrait', 'photoshoot', 'canon', 'nikon', 'naturephotography', 'streetphotography', 'photographylovers', 'capture', 'camera', 'bestoftheday', 'photoart', 'shotoniphone', 'landscapephotography', 'exposure'],
  },
  {
    key: 'business', label: 'Business & Entrepreneurship',
    keywords: ['business', 'entrepreneur', 'startup', 'marketing', 'success', 'hustle', 'ceo'],
    tags: ['business', 'entrepreneur', 'entrepreneurship', 'success', 'startup', 'marketing', 'smallbusiness', 'motivation', 'businessowner', 'hustle', 'entrepreneurlife', 'leadership', 'businessgrowth', 'digitalmarketing', 'branding', 'goals', 'mindset', 'money', 'ceo', 'productivity'],
  },
  {
    key: 'tech', label: 'Technology',
    keywords: ['tech', 'technology', 'software', 'coding', 'programming', 'developer', 'ai', 'gadget'],
    tags: ['technology', 'tech', 'innovation', 'coding', 'programming', 'developer', 'software', 'ai', 'machinelearning', 'startup', 'gadgets', 'computerscience', 'webdevelopment', 'engineering', 'techtrends', 'artificialintelligence', 'code', 'techie', 'digital', 'future'],
  },
  {
    key: 'art', label: 'Art & Design',
    keywords: ['art', 'artist', 'drawing', 'painting', 'illustration', 'design', 'creative', 'sketch'],
    tags: ['art', 'artist', 'artwork', 'drawing', 'illustration', 'painting', 'creative', 'design', 'artistsoninstagram', 'digitalart', 'sketch', 'artoftheday', 'fineart', 'contemporaryart', 'artgallery', 'instaart', 'artlovers', 'handmade', 'watercolor', 'artistic'],
  },
  {
    key: 'music', label: 'Music',
    keywords: ['music', 'musician', 'song', 'singer', 'band', 'concert', 'producer', 'dj'],
    tags: ['music', 'musician', 'song', 'singer', 'newmusic', 'artist', 'musicvideo', 'band', 'livemusic', 'concert', 'producer', 'musiclover', 'hiphop', 'guitarist', 'musicproducer', 'dj', 'spotify', 'songwriter', 'musicislife', 'indiemusic'],
  },
  {
    key: 'pets', label: 'Pets & Animals',
    keywords: ['pet', 'pets', 'dog', 'cat', 'animal', 'puppy', 'kitten'],
    tags: ['dog', 'dogsofinstagram', 'cat', 'catsofinstagram', 'pet', 'petstagram', 'puppy', 'kitten', 'animals', 'doglover', 'catlover', 'instapet', 'cute', 'dogs', 'cats', 'petsofinstagram', 'animallovers', 'furbaby', 'rescuedog', 'pupper'],
  },
  {
    key: 'gaming', label: 'Gaming',
    keywords: ['gaming', 'gamer', 'game', 'videogames', 'esports', 'twitch', 'streamer', 'playstation', 'xbox'],
    tags: ['gaming', 'gamer', 'videogames', 'game', 'esports', 'twitch', 'gamingcommunity', 'streamer', 'pcgaming', 'gamers', 'playstation', 'xbox', 'nintendo', 'gameplay', 'gamerlife', 'onlinegaming', 'gamingsetup', 'fortnite', 'leagueoflegends', 'games'],
  },
  {
    key: 'motivation', label: 'Motivation & Mindset',
    keywords: ['motivation', 'inspiration', 'mindset', 'quotes', 'selfimprovement', 'growth'],
    tags: ['motivation', 'inspiration', 'motivationalquotes', 'success', 'mindset', 'quotes', 'positivity', 'selflove', 'growth', 'goals', 'believe', 'motivational', 'lifequotes', 'inspire', 'selfimprovement', 'hardwork', 'dreambig', 'positivevibes', 'mindfulness', 'nevergiveup'],
  },
  {
    key: 'lifestyle', label: 'Lifestyle',
    keywords: ['lifestyle', 'life', 'blogger', 'dailylife', 'vlog'],
    tags: ['lifestyle', 'life', 'love', 'instagood', 'happy', 'photooftheday', 'follow', 'like', 'blogger', 'lifestyleblogger', 'instadaily', 'goodvibes', 'dailylife', 'selfcare', 'live', 'happiness', 'vibes', 'inspiration', 'blessed', 'enjoylife'],
  },
  {
    key: 'home', label: 'Home & Interior Design',
    keywords: ['home', 'interior', 'decor', 'homedecor', 'design', 'diy', 'renovation'],
    tags: ['homedecor', 'interiordesign', 'home', 'design', 'interior', 'decor', 'homedesign', 'furniture', 'architecture', 'homesweethome', 'interiorstyling', 'diy', 'homeinspo', 'decoration', 'interiors', 'renovation', 'realestate', 'housedesign', 'minimalism', 'cozyhome'],
  },
  {
    key: 'wedding', label: 'Wedding',
    keywords: ['wedding', 'bride', 'groom', 'engagement', 'bridal', 'weddingday'],
    tags: ['wedding', 'weddingday', 'bride', 'weddingphotography', 'weddinginspiration', 'bridetobe', 'weddingplanner', 'love', 'groom', 'weddingdress', 'engaged', 'weddingideas', 'bridal', 'weddingphotographer', 'engagement', 'weddingdecor', 'married', 'instawedding', 'weddingseason', 'weddinginspo'],
  },
  {
    key: 'health', label: 'Health & Wellness',
    keywords: ['health', 'wellness', 'mentalhealth', 'nutrition', 'wellbeing', 'mindfulness', 'yoga'],
    tags: ['health', 'wellness', 'healthylifestyle', 'mentalhealth', 'nutrition', 'selfcare', 'healthy', 'wellbeing', 'yoga', 'mindfulness', 'healthyliving', 'fitness', 'motivation', 'health', 'meditation', 'holistichealth', 'balance', 'healing', 'organic', 'vegan'],
  },
  {
    key: 'education', label: 'Education',
    keywords: ['education', 'learning', 'student', 'school', 'study', 'teacher', 'college', 'university'],
    tags: ['education', 'learning', 'student', 'school', 'study', 'teacher', 'college', 'university', 'knowledge', 'studygram', 'studymotivation', 'onlinelearning', 'students', 'studytips', 'elearning', 'teaching', 'studyhard', 'graduation', 'exam', 'academics'],
  },
  {
    key: 'nature', label: 'Nature & Outdoors',
    keywords: ['nature', 'outdoors', 'hiking', 'mountains', 'forest', 'landscape', 'earth'],
    tags: ['nature', 'naturelovers', 'outdoors', 'landscape', 'earth', 'hiking', 'mountains', 'naturephotography', 'wilderness', 'forest', 'sunset', 'explore', 'adventure', 'beautiful', 'naturelover', 'sky', 'green', 'trees', 'ecofriendly', 'getoutside'],
  },
  {
    key: 'family', label: 'Family & Parenting',
    keywords: ['family', 'parenting', 'kids', 'baby', 'mom', 'dad', 'children'],
    tags: ['family', 'love', 'parenting', 'kids', 'baby', 'mom', 'motherhood', 'dad', 'fatherhood', 'children', 'familytime', 'parents', 'toddler', 'babiesofinstagram', 'familylove', 'momlife', 'cute', 'parentinglife', 'familyfirst', 'kidsofinstagram'],
  },
]

// Generic tags that fit almost any post — added as a small top-off regardless
// of niche match.
export const GENERIC_TAGS = ['instagood', 'photooftheday', 'love', 'follow', 'like4like', 'picoftheday', 'instadaily', 'trending']

export function generateHashtags(query: string): { niche: HashtagNiche | null; tags: string[] } {
  const q = query.trim().toLowerCase()
  if (!q) return { niche: null, tags: [] }

  const words = q.split(/\s+/)

  const niche: HashtagNiche | null =
    HASHTAG_NICHES.find((n) => n.key === q || n.label.toLowerCase() === q) ||
    HASHTAG_NICHES.find((n) => n.keywords.some((k) => words.includes(k))) ||
    HASHTAG_NICHES.find((n) => n.keywords.some((k) => q.includes(k) || k.includes(q))) ||
    null

  const keywordSlug = q.replace(/[^a-z0-9]/gi, '')
  const derived = keywordSlug
    ? [keywordSlug, `${keywordSlug}gram`, `${keywordSlug}life`, `${keywordSlug}love`, `${keywordSlug}lover`, `${keywordSlug}community`]
    : []

  const nicheTags = niche ? niche.tags : []
  const combined = [...new Set([...derived, ...nicheTags, ...GENERIC_TAGS])]

  return { niche, tags: combined.slice(0, 30) }
}
