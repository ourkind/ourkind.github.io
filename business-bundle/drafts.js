(function () {
  var IND = {
    recruit: {
      l: "Recruiting, staffing and HR",
      a: "Utah owners with 10 to 75 employees",
      p: [
        "Hiring takes time away from running the business",
        "Open roles put pressure on the team",
        "Hiring steps need a clear owner",
      ],
      h: ["recruiting", "humanresources", "Utah"],
    },
    custom: { l: "Custom (type your own)", a: "", p: ["", "", ""], h: [] },
    field: {
      l: "Home and field services",
      a: "contractors and field-service owners",
      p: [
        "Estimates stack up after hours",
        "Leads go cold while you are on a job",
        "Invoices and paperwork eat your nights",
      ],
      h: ["contractor", "smallbusiness", "hvac", "plumber"],
    },
    hosp: {
      l: "Restaurants and hospitality",
      a: "restaurant and bar owners",
      p: [
        "Scheduling and ordering eat your nights",
        "Reviews and inquiries pile up unanswered",
        "The books wait until after close",
      ],
      h: ["restaurantowner", "hospitality", "barowner"],
    },
    retail: {
      l: "Retail and e-commerce",
      a: "retail and online store owners",
      p: [
        "Inventory and reorders are tracked by hand",
        "Customer questions get answered one at a time",
        "Promos and posts are always last on the list",
      ],
      h: ["ecommerce", "retail", "shopsmall"],
    },
    pro: {
      l: "Professional services",
      a: "agency, legal, accounting and consulting owners",
      p: [
        "Proposals and follow-ups are rewritten from scratch",
        "Client intake drags for days",
        "Billable hours disappear into admin",
      ],
      h: ["consulting", "agencylife", "professionalservices"],
    },
    health: {
      l: "Health and dental",
      a: "practice owners",
      p: [
        "No-shows leave gaps in the schedule",
        "Phones are tied up with the same questions",
        "Intake and insurance paperwork pile up",
      ],
      h: ["dentalpractice", "healthcare", "practicemanagement"],
    },
    re: {
      l: "Real estate",
      a: "agents and brokers",
      p: [
        "Leads go cold before you call back",
        "Showings and follow-ups are scheduled by hand",
        "Listing copy is rewritten every time",
      ],
      h: ["realestate", "realtor", "listings"],
    },
    mfg: {
      l: "Manufacturing",
      a: "manufacturers and shop owners",
      p: [
        "Quotes and purchase orders are re-keyed by hand",
        "Production status is chased by phone",
        "Month-end reports are built in spreadsheets",
      ],
      h: ["manufacturing", "smallmanufacturer", "operations"],
    },
    fit: {
      l: "Fitness and wellness",
      a: "gym, studio and coach owners",
      p: [
        "Members quietly stop showing up",
        "Booking and billing go back and forth",
        "Content never gets posted",
      ],
      h: ["gymowner", "fitnessbusiness", "wellness"],
    },
    trade: {
      l: "Traders and prop firm accounts",
      a: "futures and prop firm traders",
      p: [
        "You break your own rules mid-session",
        "You oversize right after a loss",
        "You have no record of why trades went wrong",
      ],
      h: ["proptrading", "futurestrading", "tradingdiscipline"],
    },
  };
  var IDS = [
    "industry",
    "biz",
    "sender",
    "offer",
    "outcome",
    "price",
    "loc",
    "audience",
    "pains",
    "proof",
    "scarcity",
    "guarantee",
    "cta",
    "tone",
  ];
  var $ = function (id) {
    return document.getElementById(id);
  };
  var tabs = [
    ["li", "LinkedIn"],
    ["fb", "Facebook and local"],
    ["sv", "Short video"],
    ["em", "Email sequence"],
    ["dm", "DM and text"],
    ["ad", "Paid ads"],
    ["gb", "Google and reviews"],
    ["wb", "Win-back and referrals"],
    ["sf", "Sales replies"],
    ["cal", "30-day plan"],
  ];
  var cur = "li",
    isExample = true;

  function strip(s) {
    return (s || "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[\s.!?;:,]+$/, "");
  }
  function cap(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  }
  function lc(s) {
    return s ? s.charAt(0).toLowerCase() + s.slice(1) : "";
  }
  function sent(s) {
    s = strip(s);
    return s ? cap(s) + "." : "";
  }
  function join() {
    return Array.prototype.slice
      .call(arguments)
      .filter(function (x) {
        return x && String(x).trim();
      })
      .join("\n\n");
  }
  function line() {
    return Array.prototype.slice
      .call(arguments)
      .filter(function (x) {
        return x && String(x).trim();
      })
      .join(" ");
  }
  function read() {
    var d = {};
    IDS.forEach(function (id) {
      d[id] = $(id).value;
    });
    return d;
  }
  function norm(d) {
    var pains = (d.pains || "").split(/\n+/).map(strip).filter(Boolean);
    if (!pains.length) {
      pains = ["Too much of your week goes to busywork"];
    }
    pains = pains.slice(0, 3);
    return {
      biz: strip(d.biz) || "my business",
      sender: strip(d.sender),
      offer: strip(d.offer) || "my service",
      outcome: strip(d.outcome) || "a clear result you can see",
      price: strip(d.price),
      loc: strip(d.loc),
      audience: strip(d.audience) || "business owners",
      pains: pains,
      proof: strip(d.proof),
      scarcity: strip(d.scarcity),
      guarantee: strip(d.guarantee),
      cta: strip(d.cta),
      tone: d.tone || "bold",
      ind: d.industry || "custom",
    };
  }
  function T(n) {
    var t = {
      bold: {
        close: "The longer this waits, the more it costs you.",
        lead: "Book now:",
        ask: "Reply YES and I will send the details",
        cold: "Stop scrolling.",
      },
      direct: {
        close: "",
        lead: "Details:",
        ask: "Reply and I will send the details",
        cold: "Quick one.",
      },
      friendly: {
        close: "No pressure. Just a better week.",
        lead: "Happy to talk:",
        ask: "Reply if you would like the details",
        cold: "Quick question.",
      },
    };
    return t[n.tone] || t.direct;
  }
  function tags(n) {
    var base = IND[n.ind] ? IND[n.ind].h : [];
    var l = n.loc ? [n.loc.replace(/[^A-Za-z0-9]/g, "")] : [];
    return base
      .concat(l)
      .filter(Boolean)
      .slice(0, 6)
      .map(function (x) {
        return "#" + x;
      })
      .join(" ");
  }
  function build(n) {
    var t = T(n),
      p = n.pains;
    var offerLine =
      cap(n.offer) +
      (n.price ? " (" + n.price + ")" : "") +
      ": " +
      n.outcome +
      ".";
    var cta = n.cta ? t.lead + " " + n.cta : "";
    var out = {};
    out.li = [
      {
        t: "Post 1: the problem",
        n: "Opens with their daily pain. Best for cold audiences.",
        x: join(
          line(sent(p[0]), sent(p[1]), sent(p[2])),
          "If that is your week, the problem is not effort. It is a missing system.",
          sent(n.proof),
          offerLine,
          sent(n.scarcity),
          t.close,
          cta,
        ),
        max: 3000,
      },
      {
        t: "Post 2: the cost",
        n: "Makes the cost of waiting concrete.",
        x: join(
          "Think about this. " + sent(p[0]) + " What is it costing you?",
          "Have you put a number on the time this takes?",
          sent(n.proof),
          offerLine,
          sent(n.scarcity),
          cta,
        ),
        max: 3000,
      },
      {
        t: "Post 3: the objection",
        n: 'Answers "I don\'t have time" head on.',
        x: join(
          '"I do not have time to fix this."',
          "That is exactly why it is still broken.",
          offerLine,
          sent(n.proof),
          sent(n.scarcity),
          t.close,
          cta,
        ),
        max: 3000,
      },
    ];
    var where = n.loc ? " in " + n.loc : "";
    out.fb = [
      {
        t: "Local engagement post",
        n: "A question gets comments, and comments lead to conversations.",
        x: join(
          cap(n.audience) +
            where +
            ": what is the one thing that eats your week?",
          "Tell me in the comments. I will tell you straight whether it can be fixed, no pitch.",
          offerLine,
          sent(n.scarcity),
          cta,
        ),
      },
      {
        t: "Offer post",
        n: "A direct ask for people who are already warm.",
        x: join(
          line(sent(p[0]), sent(p[1])),
          sent(n.proof),
          offerLine,
          sent(n.guarantee),
          sent(n.scarcity),
          t.close,
          cta,
        ),
      },
    ];
    var hookA =
      "Calling all " + n.audience + ": " + sent(p[0]) + " Stop scrolling.";
    out.sv = [
      {
        t: "Hook options",
        n: "Pick one. The first two seconds decide everything.",
        x: [
          "1. " + hookA,
          "2. " +
            (n.proof
              ? cap(n.proof) + ". Here is how."
              : "Here is the fastest way to fix this."),
          "3. The number one thing costing " +
            n.audience +
            " money: " +
            lc(strip(p[1] || p[0])) +
            ".",
        ].join("\n"),
      },
      {
        t: "15 to 30 second script",
        n: "Hook, problem, answer, ask.",
        x: join(
          "HOOK: " + hookA,
          "PROBLEM: " + line(sent(p[0]), sent(p[1]), sent(p[2])),
          "ANSWER: " + offerLine,
          "PROOF: " + sent(n.proof),
          "ASK: " +
            (n.cta
              ? cap(t.lead.replace(":", "")) + " at " + n.cta + "."
              : "Message me to get started.") +
            " " +
            sent(n.scarcity),
        ),
      },
      {
        t: "Caption and hashtags",
        n: "For Instagram, TikTok and Reels.",
        x: join(
          sent(p[0]),
          offerLine,
          n.cta ? "Link or number: " + n.cta : "",
          tags(n),
        ),
      },
    ];
    var subj = [
      strip(p[0]) + "?",
      "A fix for: " + lc(strip(p[0])),
      "Quick question, {first name}",
    ];
    var sig = join(n.sender, n.biz + (n.cta ? " | " + n.cta : "")).replace(
      /\n\n/,
      "\n",
    );
    out.em = [
      {
        t: "Email 1: the opener",
        n: "Subject options: " + subj.join("  |  "),
        x: join(
          "Hi {first name},",
          "I work with " + n.audience + ". " + (n.proof ? sent(n.proof) : ""),
          line(sent(p[0]), sent(p[1]), "Sound familiar?"),
          "Here is what I do about it: " + offerLine,
          line(
            sent(n.scarcity),
            "Would you like to discuss " + n.offer + " this week?",
          ),
          sig,
        ),
      },
      {
        t: "Email 2: follow-up, send day 3",
        n: "Short, adds one new idea.",
        x: join(
          "Hi {first name},",
          "Following up. If you are losing time and want to understand where, " +
            cap(n.offer) +
            " shows you exactly where, and what it is worth to fix.",
          sent(n.outcome),
          "Want me to hold a spot for you?",
          sig,
        ),
      },
      {
        t: "Email 3: close the loop, send day 7",
        n: "Polite last note. Use when closing a conversation.",
        x: join(
          "Hi {first name},",
          "I will stop filling your inbox after this one. If this is ever worth fixing, " +
            n.offer +
            " is here" +
            (n.price ? " for " + n.price : "") +
            ".",
          "Reply any time and I will pick it up from there.",
          sig,
        ),
      },
    ];
    out.dm = [
      {
        t: "Direct message",
        n: "For LinkedIn, Facebook or Instagram.",
        x: join(
          "Hey {first name}, " + lc(t.cold) + " " + sent(p[0]),
          "If that sounds like you, here is the fix: " + offerLine,
          t.ask + ".",
        ),
      },
      {
        t: "Text message",
        n: "Keep it under 160 characters if you can.",
        x: line(
          "Hi {first name},",
          strip(p[0]) + "?",
          cap(n.offer) + (n.price ? " is " + n.price : " can fix that") + ".",
          n.cta ? n.cta : "Want details?",
        ),
        max: 160,
      },
    ];

    function trunc(x, m) {
      x = strip(x);
      if (x.length <= m) return x;
      var c = x.slice(0, m);
      var i = c.lastIndexOf(" ");
      return strip(i > m * 0.5 ? c.slice(0, i) : c);
    }
    var g = sent(n.guarantee);
    var h1 = trunc(cap(n.offer), 30),
      h2 = trunc(n.price || "Book Today", 30),
      h3 = trunc("For " + n.audience, 30);
    var d1 = trunc(sent(n.outcome), 90),
      d2 = trunc(line(sent(p[0]), "Book today."), 90);
    out.ad = [
      {
        t: "Facebook and Instagram ad 1",
        n: "Primary text, headline (40 characters max) and description.",
        x: join(
          "PRIMARY TEXT:\n" +
            join(
              line(sent(p[0]), sent(p[1])),
              sent(n.proof),
              offerLine,
              g,
              sent(n.scarcity),
            ),
          "HEADLINE:\n" +
            trunc(cap(n.offer) + (n.price ? " - " + n.price : ""), 40),
          "DESCRIPTION:\n" + trunc(sent(n.outcome), 30),
          "BUTTON: Learn more",
        ),
      },
      {
        t: "Facebook and Instagram ad 2",
        n: "A shorter, question-led version to test against ad 1.",
        x: join(
          "PRIMARY TEXT:\n" +
            join(
              "Still dealing with this? " + sent(p[0]),
              "Here is the fix: " + offerLine,
              g,
              cta,
            ),
          "HEADLINE:\n" +
            trunc("Fix this for " + (n.price || "less than you think"), 40),
          "DESCRIPTION:\n" + trunc(cap(n.audience), 30),
          "BUTTON: Book now",
        ),
      },
      {
        t: "Google search ad",
        n: "Headlines are 30 characters max, descriptions 90. Trimmed to fit.",
        x: [
          "HEADLINES",
          "1. " + h1 + " (" + h1.length + ")",
          "2. " + h2 + " (" + h2.length + ")",
          "3. " + h3 + " (" + h3.length + ")",
          "",
          "DESCRIPTIONS",
          "1. " + d1 + " (" + d1.length + ")",
          "2. " + d2 + " (" + d2.length + ")",
        ].join("\n"),
      },
    ];
    out.gb = [
      {
        t: "Google Business Profile post",
        n: "Post as an Offer or Update. Add a photo and the Book button.",
        x: join(
          cap(n.offer) + (n.loc ? " in " + n.loc : "") + ".",
          sent(n.outcome),
          sent(n.proof),
          n.price ? "Price: " + n.price + "." : "",
          g,
          sent(n.scarcity),
          n.cta ? "Call or book: " + n.cta : "",
        ),
      },
      {
        t: "Review request: text",
        n: "Send within a day of finishing the job.",
        x:
          "Hi {first name}, thank you for choosing " +
          n.biz +
          ". If we did right by you, would you leave a quick review? It takes about a minute and helps other " +
          n.audience +
          " find us. [your review link]",
      },
      {
        t: "Review request: email",
        n: "For clients who prefer email.",
        x: join(
          "Subject: How did we do?",
          "Hi {first name},",
          "Thank you for choosing " +
            n.biz +
            ". Your review is how other " +
            n.audience +
            " decide who to trust. If you have a minute, here is the link: [your review link]",
          "Thank you,\n" + (n.sender || n.biz),
        ),
      },
      {
        t: "Reply to a 5-star review",
        n: "Public reply. Mention one detail from their review.",
        x:
          "Thank you, {name}. It was a pleasure to work with you, and we are glad it worked out for you. If you ever need anything, we are one message away. " +
          (n.sender || n.biz),
      },
      {
        t: "Reply to a negative review",
        n: "Calm, public, and moves it offline.",
        x:
          "Thank you for telling us, {name}. This is not the experience we want anyone to have. Please contact me directly" +
          (n.cta ? " at " + n.cta : "") +
          " so I can make it right. " +
          (n.sender || n.biz),
      },
    ];
    out.wb = [
      {
        t: "Win-back email",
        n: "For past customers and old leads.",
        x: join(
          "Subject: Still dealing with this?",
          "Hi {first name},",
          "It has been a while. " +
            sent(p[0]) +
            " If that is back on your plate, " +
            offerLine,
          g,
          line(sent(n.scarcity), "Reply and I will fit you in."),
          n.sender || n.biz,
        ),
      },
      {
        t: "Win-back text",
        n: "Short and personal.",
        x:
          "Hi {first name}, " +
          (n.sender || n.biz) +
          " here. " +
          sent(p[0]) +
          " Still a problem? " +
          cap(n.offer) +
          (n.price ? " is " + n.price : " can fix it") +
          ". Want me to hold a spot?",
        max: 160,
      },
      {
        t: "Referral ask: email",
        n: "Ask right after a win, when the client is happiest.",
        x: join(
          "Subject: Who else should I help?",
          "Hi {first name},",
          "I am glad the work paid off for you. Do you know another business owner who could use the same help? An introduction is the best compliment you can pay me. As thanks: [your thank-you offer].",
          "Thank you,\n" + (n.sender || n.biz),
        ),
      },
      {
        t: "Referral ask: text",
        n: "One line. Easy to forward.",
        x:
          "Hi {first name}, know anyone who could use the same help? Send them my way" +
          (n.cta ? ": " + n.cta : "") +
          " and I will thank you with [your thank-you offer].",
        max: 200,
      },
    ];
    out.sf = [
      {
        t: "Quote follow-up, day 2",
        n: "Checks in without pushing.",
        x: join(
          "Hi {first name},",
          "Following up on what we discussed. I am happy to walk through the details of " +
            n.offer +
            ".",
          "Anything I can clear up before you decide?",
          line(sent(n.scarcity), cta),
          n.sender || n.biz,
        ),
      },
      {
        t: '"It costs too much"',
        n: "Reframe price against the cost of the problem.",
        x: join(
          "I hear you, and it is a fair question.",
          "Compare " +
            (n.price || "the price") +
            " to what this problem costs you every month. " +
            (n.proof ? sent(n.proof) : ""),
          g ||
            "If it does not pay for itself, I would rather tell you than take your money.",
          "Want to walk through your numbers together?",
        ),
      },
      {
        t: '"Let me think about it"',
        n: "Find the real objection.",
        x: join(
          "Of course. To help you think it through, what is the one thing that would make this an easy yes?",
          "If it is timing, price or trust, I can address any of them.",
          sent(n.scarcity),
        ),
      },
      {
        t: '"Not right now"',
        n: "Keep the door open and set a date.",
        x: join(
          "Understood. When does it make sense to revisit this: next month, or next quarter?",
          "I will check back then. In the meantime, the problem will still be there. " +
            cap(n.offer) +
            " is ready when you are.",
        ),
      },
      {
        t: '"I will do it myself"',
        n: "Respect it, then show the cost of DIY.",
        x: join(
          "That is a smart instinct, and some people should.",
          "The question is what your hours are worth. " +
            (n.proof ? sent(n.proof) : ""),
          cap(n.offer) +
            " exists so " +
            n.audience +
            " get " +
            lc(strip(n.outcome)) +
            " without the learning curve.",
        ),
      },
    ];
    var themes = [
      "Problem story",
      "Proof",
      "Quick tip",
      "The offer",
      "Common question",
      "Behind the scenes",
      "Question for your audience",
    ];
    var cal = [];
    for (var i = 0; i < 30; i++) {
      var th = themes[i % 7],
        pp = strip(p[i % p.length]),
        ln,
        ct = n.cta ? " End with: " + n.cta + "." : "";
      if (th === "Problem story")
        ln = "Describe a real day when " + lc(pp) + ". Make the reader nod.";
      else if (th === "Proof")
        ln = n.proof
          ? "Tell the story behind: " + lc(n.proof) + ". Add one number."
          : "Share a verified result with permission, or explain your process.";
      else if (th === "Quick tip")
        ln =
          "Give 3 quick tips for " +
          n.audience +
          " dealing with: " +
          lc(pp) +
          ". No pitch.";
      else if (th === "The offer")
        ln =
          "Post the offer: " +
          cap(n.offer) +
          (n.price ? " at " + n.price : "") +
          ". Lead with " +
          lc(strip(n.outcome)) +
          "." +
          (n.scarcity ? " Mention: " + n.scarcity + "." : "");
      else if (th === "Common question")
        ln =
          "Answer the question you hear most about " +
          lc(n.offer) +
          (n.price ? ", including what it costs" : "") +
          ".";
      else if (th === "Behind the scenes")
        ln =
          "Show how you work: one photo or short clip from a normal day at " +
          n.biz +
          ".";
      else
        ln =
          "Ask " +
          n.audience +
          ': does this sound familiar? "' +
          pp +
          '." Reply to every comment.';
      cal.push(
        "Day " +
          (i + 1) +
          " | " +
          th +
          " | " +
          ln +
          (th === "The offer" || th === "Proof" ? ct : ""),
      );
    }
    out.cal = [
      {
        t: "30 days of content",
        n: "Post once a day, or pick 3 to 5 days a week. Reuse the drafts in the other tabs for the Offer and Proof days.",
        x: cal.join("\n"),
      },
    ];
    return out;
  }

  window.Drafts = {
    industries: IND,
    tabs: tabs,
    fields: IDS,
    generate: function (d) {
      return build(norm(d));
    },
  };
})();
