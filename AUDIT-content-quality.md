# Content Quality & Tone Audit

**Generated:** 2026-04-03
**Scope:** All 21 MDX articles, comparison page components, editorial content in page components

---

## 1. AI Slop & Filler Language

### Result: CLEAN

Searched the entire codebase for: "unlock", "empower", "revolutionize", "comprehensive guide", "ultimate", "navigate the world of", "in today's landscape", "whether you're a beginner or expert", "look no further", "dive in", "harness the power of", "game-changer", "supercharge", "groundbreaking", "cutting-edge", "seamlessly", "robust", "delve", "tapestry", "realm of", "myriad", "plethora", "pivotal".

**Zero instances found.** The writing is consistently natural and conversational — reads like a knowledgeable peer explaining things to another investor, not like AI-generated content or marketing copy.

### Minor Borderline Phrases (acceptable in context)

| File | Line | Phrase | Verdict |
|------|------|--------|---------|
| `veqt-vs-robo-advisors.mdx` | 127 | "it's worth noting" | Acceptable — used once in a factual clarification |

---

## 2. Unsupported or Loosely Worded Claims

### Needs Hedging / Rewording

| File | Line | Claim | Issue | Suggested Fix |
|------|------|-------|-------|---------------|
| `forex-vs-veqt.mdx` | 127 | "investing in your career has a near-guaranteed positive return" | Overstates certainty — career investments can fail (layoffs, bad credentials, wrong market) | Change to: "investing in your career has a **far higher expected return**" |
| `veqt-tfsa-rrsp-taxable.mdx` | 49 | "anyone who wants guaranteed tax-free growth" | TFSA growth isn't guaranteed — investments can lose value; the *tax treatment* is guaranteed | Change to: "anyone who wants **tax-free investment growth**" (drop "guaranteed") |
| `forex-vs-veqt.mdx` | 152 | "almost *any* productive use of 500 hours...will outperform spending that time staring at EUR/USD charts" | Hyperbolic — some productive uses don't have financial returns | Change to: "almost any productive use of 500 hours **is likely to** outperform" |

### Properly Hedged (no action needed)

These looked suspicious but are actually well-sourced or properly qualified:

| File | Claim | Why It's Fine |
|------|-------|---------------|
| `forex-vs-veqt.mdx` | "75-90% of retail forex traders lose money" | Sourced to ESMA broker disclosures and CFTC data |
| `forex-vs-veqt.mdx` | "only approximately 1.6% of day traders are able to predictably profit" | Sourced to Barber, Lee, Odean (2010) |
| `veqt-vs-vfv.mdx` | Japan Nikkei 35-year recovery claim | Factually accurate (Dec 1989 → Feb 2024) |
| `covered-call-dividend-trap.mdx` | "every single covered call fund underperformed" | Attributed to Ben Felix / Rational Reminder Ep 375 |
| All calculators | 8.5% return assumption | All include disclaimers: "Illustrative hypothetical returns only" |
| `veqt-is-down.mdx` | "10%+ drops occur roughly every 1-2 years" | Historical frequency claim, properly hedged with "roughly" |

---

## 3. Comparison Page Fairness Assessment

### veqt-vs-xeqt.mdx — FAIR
- Explicitly states "if you buy XEQT instead of VEQT, you'll probably be fine"
- Acknowledges identical MERs, similar performance
- Lists specific scenarios where XEQT makes sense (US tilt preference, existing positions)
- Says "if you already hold XEQT, there's no reason to switch"
- **Leans VEQT** but is transparent about it being editorial opinion

### veqt-vs-vfv.mdx — FAIR
- Acknowledges VFV's superior recent performance openly
- "We're not going to pretend VFV is never the right choice"
- Lists 3 specific scenarios where VFV is reasonable (satellite position, taxable account MER savings, conscious concentration bet)
- Japan example is used responsibly as a historical parallel, not a prediction
- **Leans VEQT** but with strong evidence-based reasoning

### veqt-vs-vgro.mdx — VERY FAIR
- Equally weighted presentation of both options
- Clear framework: "When VEQT makes sense" and "When VGRO makes sense" given equal space
- Explicitly says the best fund is one you won't panic-sell
- Recommends VGRO for anyone within 5-10 years of needing money
- **Balanced** — neither is positioned as universally better

### veqt-vs-diy-portfolio.mdx — FAIR
- Honestly quantifies the DIY savings (~$50/year on $100K)
- Acknowledges DIY is cheaper and can make sense above $750K
- Clearly lists behavioral risks as genuine tradeoffs, not dismissals
- **Leans VEQT** but respects the DIY approach for disciplined investors

### veqt-vs-robo-advisors.mdx — VERY FAIR
- One of the most balanced articles on the site
- Explicitly says "we'd rather you invest in a robo-advisor consistently than buy VEQT sporadically"
- Genuine acknowledgment of robo advantages (behavioral guardrails, TLH, automation)
- Recommends robo-advisors as a stepping stone strategy
- **Balanced** — positions both as legitimate strategies for different personalities

### covered-call-dividend-trap.mdx — ONE-SIDED (intentionally)
- This is a thesis piece, not a comparison
- Acknowledges "narrow edge cases" for income products (retirees with low marginal tax rates)
- All claims are sourced to Ben Felix's research
- **One-sided by design** — editorial opinion piece, clearly positioned as such

### forex-vs-veqt.mdx — ONE-SIDED (intentionally)
- Also a thesis piece, not a balanced comparison
- Acknowledges the 10% who succeed at forex (with caveats)
- All statistics sourced to ESMA, CFTC, academic papers
- **One-sided by design** — the data genuinely supports the thesis

### Verdict Data (data/verdicts.ts) — FAIR
- Each comparison verdict identifies multiple winner categories, distributed between both funds
- MER categories now correctly show "Tie" for VEQT vs XEQT and VEQT vs ZEQT
- Recommendations acknowledge both options: "If you already hold one, there's no compelling reason to switch"
- VFV verdict explicitly states "both approaches have decades of evidence behind them"

---

## 4. Structural Quality Check

### Title Quality

| Article | Title | Assessment |
|---------|-------|------------|
| what-is-veqt | "What Is VEQT? A Simple Explanation" | Clear, specific |
| getting-started-with-veqt | "Getting Started with VEQT: A Beginner's Complete Guide" | Clear, specific |
| why-we-choose-veqt-over-xeqt | "Why We Choose VEQT Over XEQT" | Clear editorial positioning |
| what-you-actually-own | "What You Actually Own When You Buy VEQT" | Engaging, specific |
| veqt-distributions-explained | "VEQT Distributions: What They Are and What to Do With Them" | Clear, actionable |
| veqt-vs-xeqt | "VEQT vs XEQT: What's the Difference?" | Standard comparison, clear |
| veqt-vs-vgro | "VEQT vs VGRO: 100% Equity or 80/20?" | Descriptive, clear differentiator |
| veqt-vs-vfv | "VEQT vs VFV: Global Diversification vs the S&P 500" | Excellent — frames the actual decision |
| veqt-vs-diy-portfolio | "VEQT vs Building Your Own Portfolio" | Clear |
| veqt-vs-robo-advisors | "VEQT vs Robo-Advisors: DIY or Let Someone Else Drive?" | Engaging analogy |
| veqt-is-down | "VEQT Is Down — What Should I Do?" | Perfectly targets the anxious searcher |
| veqt-tfsa-rrsp-taxable | "VEQT in a TFSA, RRSP, or Taxable Account" | Descriptive |
| veqt-in-your-fhsa | "VEQT in Your FHSA: Is It the Right Fit?" | Clear question format |
| automate-veqt-purchases | "How to Automate Your VEQT Purchases" | Actionable |
| veqt-mer-true-cost | "What VEQT's MER Actually Costs You" | Engaging, specific |
| how-veqt-rebalances | "How VEQT Rebalances (And Why You Don't Have To)" | Benefit-focused |
| lump-sum-vs-dca | "Lump Sum vs DCA: How to Invest a Large Amount in VEQT" | Specific use case |
| veqt-currency-risk | "How Currency Movements Affect Your VEQT Returns" | Descriptive |
| passive-investing-behavioral-edge | "The Real Edge of Passive Investing Isn't What You Think" | Curiosity-driven, not clickbait |
| covered-call-dividend-trap | "The Dividend & Covered Call Trap: Why VEQT Beats 'Income' ETFs" | Clear thesis |
| forex-vs-veqt | "Forex Trading vs. Just Buying VEQT: The Opportunity Cost Nobody Talks About" | Specific, thesis-driven |

**All titles are clear, specific, and avoid generic clickbait.**

### Difficulty Badges

| Article | Category | Difficulty | Assessment |
|---------|----------|------------|------------|
| what-is-veqt | beginner | beginner | Correct |
| getting-started-with-veqt | beginner | beginner | Correct |
| why-we-choose-veqt-over-xeqt | comparison | beginner | Correct (editorial but accessible) |
| what-you-actually-own | beginner | beginner | Correct |
| veqt-distributions-explained | beginner | beginner | Correct |
| veqt-vs-xeqt | comparison | beginner | Correct |
| veqt-vs-vgro | comparison | beginner | Correct |
| veqt-vs-vfv | comparison | beginner | Correct |
| veqt-vs-diy-portfolio | veqt-deep-dive | intermediate | Correct |
| veqt-vs-robo-advisors | comparison | beginner | Correct |
| veqt-is-down | beginner | beginner | Correct |
| veqt-tfsa-rrsp-taxable | tax-strategy | intermediate | Correct |
| veqt-in-your-fhsa | tax-strategy | intermediate | Correct |
| automate-veqt-purchases | beginner | beginner | Correct |
| veqt-mer-true-cost | veqt-deep-dive | intermediate | Correct |
| how-veqt-rebalances | veqt-deep-dive | intermediate | Correct |
| lump-sum-vs-dca | beginner | beginner | Correct |
| veqt-currency-risk | veqt-deep-dive | intermediate | Correct |
| passive-investing-behavioral-edge | opinion | beginner | Correct (accessible behavioral piece) |
| covered-call-dividend-trap | veqt-deep-dive | intermediate | Correct |
| forex-vs-veqt | veqt-deep-dive | beginner | Correct |

**All badges appear appropriate.**

### Broken Internal Links

Audited all `](/` patterns in MDX files. Every internal link maps to a valid route:
- `/learn/*` slugs all exist
- `/compare/*` slugs all exist
- `/invest`, `/distributions`, `/inside-veqt`, `/today` all exist
- External links (reddit, vanguard.ca) are correct

**Zero broken links found.**

### Placeholder / TODO Content

Searched for TODO, FIXME, PLACEHOLDER, TBD, COMING SOON, lorem ipsum.

**Zero instances of leftover placeholder content.**

---

## 5. Summary

### Overall Assessment: VERY STRONG

The content is remarkably clean for a 21-article site. Zero AI slop, zero broken links, zero placeholder content, well-balanced comparison pages, and properly sourced claims.

### Items to Fix (3 total)

1. **`forex-vs-veqt.mdx:127`** — "near-guaranteed positive return" → "far higher expected return"
2. **`veqt-tfsa-rrsp-taxable.mdx:49`** — "guaranteed tax-free growth" → "tax-free investment growth"
3. **`forex-vs-veqt.mdx:152`** — "will outperform" → "is likely to outperform"

### Strengths Worth Preserving

- **Voice consistency**: Every article sounds like the same knowledgeable person talking
- **Fairness**: Comparison articles honestly acknowledge when alternatives make sense
- **Source attribution**: Claims cite specific researchers, episodes, dates
- **No marketing-speak**: Reads like editorial content, not ad copy
- **Strong internal linking**: Articles reference each other naturally, creating a content ecosystem
- **Appropriate disclaimers**: All articles end with "not financial advice" disclaimer
