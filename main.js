const allowListedTriggers = {
  "wikipedia.org": ["wikipedia", "wiki article", "site:wikipedia.org"],
  "imdb.com": ["imdb", "site:imdb.com", "imdb page"],
  "letterboxd.com": ["letterboxd", "site:letterboxd.com"],
  "buzzfeed.com": ["buzzfeed", "site:buzzfeed.com"],
  "screenrant.com": ["screenrant", "site:screenrant.com", "screen rant"],
  "pinterest.com": ["pinterest", "site:pinterest.com"],
  "quora.com": ["quora", "site:quora.com"],
  "wegotthiscovered.com": ["we got this covered", "site:wegotthiscovered.com"],
  "cnet.com": ["cnet", "site:cnet.com"],
  "thecut.com": ["the cut", "site:thecut.com"],
  "nymag.com": ["new york magazine", "nymag", "site:nymag.com"],
  "facebook.com": ["facebook", "site:facebook.com"],
  "nypost.com": ["new york post", "nypost", "site:nypost.com"],
  "foxnews.com": ["fox news", "site:foxnews.com"],
  "wsj.com": ["wall street journal", "wsj", "site:wsj.com"],
  "washingtonpost.com": ["washington post", "site:washingtonpost.com"],
  "cnn.com": ["cnn", "site:cnn.com"],
  "msnbc.com": ["msnbc", "site:msnbc.com"],
  "justanswer.com": ["just answer", "site:justanswer.com"],
  "rottentomatoes.com": ["rotten tomatoes", "site:rottentomatoes.com"],
  "medium.com": ["medium", "site:medium.com"],
  "amazon.com": ["amazon", "site:amazon.com"],
  "yelp.com": ["yelp", "site:yelp.com"],
  "youtube.com": ["youtube", "site:youtube.com", "youtube video"]
};

const smartIncludeMap = {
  "youtube.com": ["youtube", "youtube.com", "youtube video"],
  "amazon.com": ["amazon", "amazon.com"]
  // Add more domains and triggers as needed
};

const intentTriggers = [
  "instagram",
  "linkedin",
  "tiktok",
  "facebook",
  "reddit",
  "x.com",
  "twitter",
  "threads",
  "onlyfans",
  "youtube",  
  "amazon"
];

const visualContentTriggers = [
  "photo",
  "photos",
  "pictures",
  "images",
  "gallery",
  "pic",
  "pics",
  "photography",
  "video",
  "videos",
  "footage",
  "clip",
  "film clip",
  "interview video",
  "music video"
];

const referenceSiteTriggers = [
  "stats",
  "career stats",
  "season stats",
  "statline",
  "box score",
  "player reference",
  "team reference",
  "basketball reference",
  "baseball reference",
  "football reference",
  "hockey reference",
  "site:baseball-reference.com",
  "site:basketball-reference.com",
  "site:pro-football-reference.com",
  "site:hockey-reference.com",
  "site:fbref.com"
];

const navigationIntentTriggers = [
  "directions to",
  "how to get to",
  "map of",
  "driving directions",
  "walking directions",
  "subway route",
  "bus route",
  "train to",
  "get to",
  "how do i get to",
  "how to go to"
];


function getSelectedModes() {
  const checkboxes = document.querySelectorAll('#advancedSearch input[type="checkbox"]');
  const selected = [];
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selected.push(checkbox.parentElement.textContent.trim());
    }
  });
  return selected;
}

function getAllowListExemptDomains(input) {
  const lowerInput = input.toLowerCase();
  return Object.entries(allowListedTriggers)
    .filter(([domain, triggers]) =>
      triggers.some(trigger => lowerInput.includes(trigger))
    )
    .map(([domain]) => domain);
}

function getSmartIncludes(input) {
  const lowerInput = input.toLowerCase();
  return Object.entries(smartIncludeMap)
    .filter(([_, triggers]) => triggers.some(trigger => lowerInput.includes(trigger)))
    .map(([domain]) => `site:${domain}`);
}

function runGoodSearch(isOldInternet = false) {
  const rawInput = document.getElementById("searchInput").value.trim();
  if (!rawInput) return;

  const input = rawInput.toLowerCase();
  const baseGoogle = "https://www.google.com/search?q=";
  const waybackBase = "https://web.archive.org/web/*/";
  const selected = document.querySelector('.checkbox-wrapper input[type="checkbox"]:checked');
  const selectedMode = selected ? selected.parentElement.textContent.trim() : "None";
  localStorage.setItem("lastSearchQuery", rawInput);
  localStorage.setItem("lastSearchMode", selectedMode);

  const allowListExemptions = getAllowListExemptDomains(rawInput);
  console.log("AllowList Exemptions:", allowListExemptions);
  const isSportsReferenceSearch = referenceSiteTriggers.some(trigger => input.includes(trigger));
  const isIntentionalSocialSearch = intentTriggers.some(trigger => input.includes(trigger));
  const isShoppingSearch = /\b(buy|cheap|price|under \$?\d+|on sale|deals?|discount|coupon|affordable)\b/i.test(input);
  const isRawAddressSearch = /\b(\d{1,5} [a-z]+\b.*\bto\b.*|from .+ to .+)/i.test(rawInput);
  const isNavigationSearch = navigationIntentTriggers.some(trigger => input.includes(trigger));
  const isStockSearch = /\b(stock|stocks|stock price|share price|ticker|quote|market cap|nasdaq|nyse)\b/i.test(input) ||
  /^[A-Z]{1,5}(\s+stock|\s+share|\s+price)?$/.test(rawInput.trim());
  const isCalculatorSearch =
  /^[\d\s\.\+\-\*\/\^\%\(\)xXsqrt√=]+$/i.test(input) ||
  /\b(\d+%?\s*(of|times|plus|minus|divided by|multiplied by|over|more than|less than|less|more)\s*\d+)\b/i.test(input) ||
  /\bwhat is\b(?! if| the| this| that| your| my| it| he| she| we| they| I| you| a| an| doing| supposed| going).+?\d/i.test(input) ||
  /\b(how much is|calculate|percent of|equals)\b.+?\d/i.test(input);
  const isCurrencySearch = /\b\d*\s?(usd|eur|gbp|jpy|cad|aud|inr|btc|eth)\b.*\b(to|in)\b.*\b(usd|eur|gbp|jpy|cad|aud|inr|btc|eth)\b/i.test(rawInput);
const isUnitConversionSearch = /\b(how many|how much|convert)?\b.*\b(cups?|ounces?|oz|grams?|g|liters?|l|ml|tbsp|tablespoons?|tsp|teaspoons?|pints?|quarts?|gallons?|kg|kilograms?|lbs?|pounds?|miles?|kilometers?|km|inches?|in|feet|ft|meters?|m)\b.*\b(to|in|from)?\b.*\b(cups?|from)?\b.*\b(cup?|ounces?|oz|grams?|g|liters?|l|ml|tbsp|tablespoons?|tsp|teaspoons?|pints?|quarts?|gallons?|kg|kilograms?|lbs?|pounds?|miles?|kilometers?|km|inches?|in|feet|ft|meters?|m)\b/i.test(input);
  const isTimeQuery = /\b(time (in|at)|current time|what time|sunrise|sunset|timezone|clock|date in|world clock|time now)\b/i.test(input);
  const isHoroscopeSearch = /\b(horoscope|zodiac|aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b/i.test(input);
  const isTranslationSearch = /\b(translate|how do you say|in (french|spanish|german|italian|japanese|korean|chinese|russian|arabic|portuguese|dutch|swedish|greek|latin))\b/i.test(input);
  const isDefinitionSearch = /\b(define|definition of|meaning of|what does .+ mean)\b/i.test(input);
  const isPackageTrackingSearch = /\b(track(ing)? (my )?(package|order)|where.*(package|order)|tracking number|usps|fedex|ups|dhl|order status)\b/i.test(input);
  const isWeatherSearch = /\b(weather|forecast|temperature|rain|snow|10 day forecast|hourly forecast)\b/i.test(input);
  const isPronunciationSearch = /\b(how to pronounce|how do you pronounce|how do you say|pronounce)\b/i.test(rawInput);
  const isJobSearch = /\b(job(s)?|hiring|careers?|positions?|work from home|freelance|gig work|resume|cv|cover letter|linkedin|upwork|fiverr|indeed|glassdoor|monster\.com|ziprecruiter)\b/i.test(input);
  const isLotterySearch = /\b(lottery|lotto|powerball|mega millions|winning numbers?|jackpot|draw results?)\b/i.test(input);
  const isBrainScienceSearch = /\b(left|right)?\s?brain\b.*(vs|hemisphere|function|science|logic|emotion)/i.test(input);
  const isRealEstateSearch = /\b(real estate|apartments?|homes?|houses? for (sale|rent)|condos?|zillow|realtor\.com|trulia|redfin)\b/i.test(rawInput);
  const isHolidayClosureSearch = /\b(open|closed|deliver|hours)\b.*\b(memorial day|labor day|juneteenth|independence day|mlk|thanksgiving|christmas|new year|holiday)/i.test(input);
  const isTVSearch = /\b(tv|television|what's on|schedule|tonight|tv guide|listings|channel guide|programming)\b/i.test(input);
  const isFlightSearch = /\b(flights?|airfare|plane tickets?|flight status|delta|jetblue|united|american airlines|southwest)\b/i.test(rawInput);
  const isVisualSearch = visualContentTriggers.some(trigger => input.includes(trigger));
 const shouldExcludeDomains = !(
  isIntentionalSocialSearch ||
  isVisualSearch ||
  isSportsReferenceSearch ||
  isNavigationSearch ||
  isRawAddressSearch ||
  isFlightSearch ||
  isShoppingSearch ||
  isPackageTrackingSearch ||
  isWeatherSearch ||
  isTimeQuery ||
  isCurrencySearch ||
  isCalculatorSearch ||
  isStockSearch ||
  isUnitConversionSearch ||
  isTranslationSearch ||
  isDefinitionSearch ||
  isJobSearch ||
  isHoroscopeSearch ||
  isLotterySearch ||
  isPronunciationSearch ||
  isTVSearch ||
  isRealEstateSearch ||
  isHolidayClosureSearch ||
  isBrainScienceSearch ||
  allowListExemptions.length > 0
);


  let finalQuery;

  // Wayback Machine shortcut
  if (selectedMode.toLowerCase() === "wayback machine") {
    const url = rawInput.replace(/\s/g, "");
    const cleanURL = url.startsWith("http") ? url : "http://" + url;
    window.open(waybackBase + cleanURL, "_blank");
    return;
  }

  // Advanced Search Modes
  if (selected) {
    const value = selectedMode.toLowerCase();
    if (value === "academic") {
      finalQuery = `${rawInput} (site:.edu OR inurl:.edu OR site:.gov OR site:.org) (filetype:pdf OR filetype:doc OR filetype:ppt) university`;
    } else if (value === "book finder") {
      finalQuery = `${rawInput} (site:archive.org OR site:openlibrary.org OR site:gutenberg.org) filetype:pdf`;
    } else if (value === "forums") {
      finalQuery = `${rawInput} (inurl:forum OR inurl:thread OR site:forumotion.com OR site:proboards.com OR site:phpbb.com OR site:boards.ie OR site:fanfiction.net)${isOldInternet ? " before:2008" : ""}`;
    } else if (value === "images") {
  const imageQuery = `${rawInput} -site:pinterest.com -site:aliexpress.com -site:amazon.com -site:facebook.com -site:etsy.com -site:ebay.com -site:deviantart.com -site:wallpapercave.com -site:wallpaperaccess.com -site:tumblr.com -site:twitter.com -site:quora.com (inurl:blog OR inurl:gallery OR inurl:museum OR inurl:photos OR inurl:collection OR inurl:photo OR inurl:image OR inurl:archive OR inurl:pic) (filetype:jpg OR filetype:png)`;
  window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(imageQuery)}`, "_blank");
  return;
    } else if (value === "indie web") {
      finalQuery = `${rawInput} (site:angelfire.com OR site:tripod.com OR site:geocities.ws OR site:fortunecity.ws OR site:xoom.com OR site:50megs.com OR site:webs.com)`;
    } else if (value === "literary mode") {
      finalQuery = `${rawInput} (site:lrb.co.uk OR site:theatlantic.com OR site:newyorker.com OR site:nplusonemag.com OR site:believermag.com OR site:harpers.org OR site:nybooks.com OR site:bookforum.com OR site:theparisreview.org OR site:granta.com OR site:salon.com OR site:hazlitt.net)`;
    } else if (value === "movie mode") {
      finalQuery = `${rawInput} (site:sensesofcinema.com OR site:brightlightsfilm.com OR site:criterion.com OR site:rogerebert.com OR site:bfi.org.uk OR site:tasteofcinema.com OR site:flickeringmyth.com OR site:moviemezzanine.com OR site:lwlies.com OR site:lostinthemovies.com OR site:thepinksmoke.com OR site:pinnlandempire.com OR site:flaszonfilm.com OR site:thecinemaholic.com OR site:filmsfatale.com OR site:jonathanrosenbaum.net OR site:rupertpupkinspeaks.wordpress.com OR site:sallitt.blogspot.com OR site:sallittfavorites.wordpress.com OR site:reverseshot.org OR site:mubi.com OR site:imdb.com OR site:letterboxd.com)`;
    } else if (value === "music mode") {
      finalQuery = `${rawInput} (site:pitchfork.com OR site:sputnikmusic.com OR site:stereogum.com OR site:popmatters.com OR site:thequietus.com OR site:allmusic.com OR site:consequence.net OR site:xlr8r.com OR site:rollingstone.com OR site:tinymixtapes.com OR site:aquariumdrunkard.com OR site:mojo4music.com OR site:uncut.co.uk OR site:thelineofbestfit.com) -site:rateyourmusic.com -site:faroutmagazine.co.uk`;
    } else if (value === "public records") {
      finalQuery = `${rawInput} (site:govinfo.gov OR site:sec.gov OR site:archives.gov OR site:justice.gov OR site:foia.gov OR site:opengovus.com OR site:pacermonitor.com OR site:justia.com OR site:law.cornell.edu OR site:case.law OR site:propertyshark.com OR site:data.gov OR site:localwiki.org OR site:documentcloud.org)${isOldInternet ? " before:2008" : ""}`;
    } else if (value === "web 1.0") {
      finalQuery = `${rawInput} before:2005 filetype:html`;
    } else if (value === "web 2.0") {
      finalQuery = `${rawInput} after:2004 before:2014 filetype:html`;
    } else {
      finalQuery = rawInput;
    }
  }

 // Old Internet mode
else if (isOldInternet) {
  finalQuery = `${rawInput} before:2008 filetype:html`;
}


// Default fallback logic
else {
  let activeFilter = null;

for (const filter of filters) {
  if (isShoppingSearch && filter.ignoreIfShopping) continue;
  if (isCalculatorSearch && filter.ignoreIfCalculator) continue;

  if (filter.trigger.some(keyword => input.includes(keyword))) {
    activeFilter = filter;
    break;
  }
}



  if (!activeFilter && knownTeams.some(team => input.includes(team))) {
    activeFilter = filters.find(f => f.trigger.includes("sports"));
  }

if (isHoroscopeSearch) {
  finalQuery = `${rawInput} (site:astrology.com OR site:astrostyle.com OR site:horoscope.com OR site:chani.com OR site:cafeastrology.com OR site:sanctuaryworld.co)`;
  window.open(baseGoogle + encodeURIComponent(finalQuery), "_blank");
  return;
}

if (isHolidayClosureSearch) {
  finalQuery = `${rawInput} (site:usps.com OR site:fedex.com OR site:ups.com OR site:dmv.org OR site:npr.org OR site:nytimes.com OR site:apnews.com)`;
  window.open(baseGoogle + encodeURIComponent(finalQuery), "_blank");
  return;
}

if (isRealEstateSearch) {
  finalQuery = `${rawInput} (site:zillow.com OR site:realtor.com OR site:trulia.com OR site:redfin.com OR site:apartments.com OR site:rent.com OR site:hotpads.com)`;
  window.open(baseGoogle + encodeURIComponent(finalQuery), "_blank");
  return;
}

if (isLotterySearch) {
  finalQuery = `${rawInput} (site:powerball.com OR site:megamillions.com OR site:lotteryusa.com OR site:lottoamerica.com OR site:nationallottery.co.uk OR site:ozlotteries.com OR site:tatts.com OR site:lottery.ca.gov OR site:nylottery.ny.gov OR site:flalottery.com OR site:txlottery.org OR site:illinoislottery.com OR site:calottery.com OR site:lottery.nd.gov)`;
  window.open(baseGoogle + encodeURIComponent(finalQuery), "_blank");
  return;

}

if (isBrainScienceSearch) {
  finalQuery = `${rawInput} (site:scientificamerican.com OR site:psychologytoday.com OR site:nature.com OR site:ncbi.nlm.nih.gov OR site:verywellmind.com OR site:apa.org OR site:sciencedaily.com OR site:harvard.edu)`;
  window.open(baseGoogle + encodeURIComponent(finalQuery), "_blank");
  return;
}

if (isPronunciationSearch) {
  finalQuery = `${rawInput} (site:youglish.com OR site:forvo.com OR site:howtopronounce.com OR site:wiktionary.org)`;
  window.open(baseGoogle + encodeURIComponent(finalQuery), "_blank");
  return;
}

if (isTVSearch) {
  finalQuery = `${rawInput} (site:tvtv.us OR site:tvguide.com OR site:ontvtonight.com OR site:zap2it.com OR site:locatetv.com)`;
  window.open(baseGoogle + encodeURIComponent(finalQuery), "_blank");
  return;
}

if (isDefinitionSearch) {
  let cleanDefinitionQuery = rawInput
    .replace(/\b(define|definition of|meaning of|what does)\b/i, '')
    .trim();

  finalQuery = `${cleanDefinitionQuery} (site:dictionary.com OR site:vocabulary.com OR site:oxfordlearnersdictionaries.com OR site:britannica.com OR site:etymonline.com)`;
  window.open(baseGoogle + encodeURIComponent(finalQuery), "_blank");
  return;
}





const smartIncludes = getSmartIncludes(rawInput);

const includes = activeFilter
  ? [...activeFilter.include, ...smartIncludes].join(" OR ")
  : [...(fallbackFilter.include || []), ...smartIncludes].join(" ");


const excludes = activeFilter
  ? activeFilter.exclude
      .filter(term => {
        const match = term.match(/^-site:(.+)$/);
        return !(match && allowListExemptions.includes(match[1]));
      })
      .join(" ")

  : shouldExcludeDomains
    ? [
        ...fallbackFilter.excludeDomains
          .filter(domain => !allowListExemptions.includes(domain))
          .map(domain => `-site:${domain}`),
        ...(fallbackFilter.excludeQueryTerms || [])
      ].join(" ")
    : "";


  finalQuery = `${rawInput} ${includes} ${excludes}${shouldExcludeDomains ? " filetype:html" : ""}`;
console.log("Excludes being applied:", excludes);

}


  window.open(baseGoogle + encodeURIComponent(finalQuery), "_blank");
}

// Enable Enter key as trigger
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      runGoodSearch();
    }
  });

  // Enforce one toggle only
  const checkboxes = document.querySelectorAll('#advancedSearch input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        checkboxes.forEach((cb) => {
          if (cb !== this) cb.checked = false;
        });
      }
    });
  });
});

function toggleHow() {
  const how = document.getElementById("howBox");
  how.style.display = (how.style.display === "none") ? "block" : "none";
}
