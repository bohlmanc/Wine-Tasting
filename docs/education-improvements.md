# Education-Focused Improvement Areas

**Context:** The app is used by a wine educator to help students learn how to taste wine confidently — picking new wines, finding tasting notes, and enjoying wine broadly. Nothing existing should be removed; these are additive improvements.

The structured tasting flow (Look → Smell → Taste → Think) is pedagogically sound and the aroma hierarchy mirrors how sommeliers are trained. The gaps are mostly about **context and coaching**, not structure.

---

## 1. Contextual Coaching During the Tasting Flow

**Goal:** Help learners *make* the observation, not just *report* it.

Currently the tasting screens ask users to record what they observe but don't explain how to observe it. A new taster who doesn't know what tannin feels like will just guess.

- **Taste screen:** Add a tap-to-reveal "How to feel this" hint per dimension.
  - Tannin: *"Press your tongue to the roof of your mouth — that drying, gripping sensation is tannin."*
  - Acidity: *"Notice the salivation on the sides of your tongue."*
  - Use the existing `InfoModal` component — no new infrastructure needed.
- **LookColor / LookDetails:** When a color is selected, show a one-line contextual insight.
  - Deep ruby → *"Deeper color often suggests more tannin or a warmer-climate grape."*
  - Pale gold → *"Light color in whites often means a cooler climate or younger wine."*
- **SmellMain + aroma sub-screens:** Add a brief prompt before selection.
  - *"Swirl the glass, then nose it. What's the first thing you notice?"*
  - Tip per aroma category: Fruit = primary aromas. Herbs/earth = tertiary. This teaches the primary/secondary/tertiary framework naturally.
- **WineStyle screen:** Add a one-sentence "what to expect" blurb per style. Selecting "Orange" should not be mysterious for a new user.

**Effort:** Low — `InfoModal` already exists; this is content + wiring.

---

## 2. The "Why Does This Matter?" Layer

**Goal:** Close the loop so learners understand what their observations *mean*, not just what they are.

- **Post-save insight card on Think screen** (before navigating home): A short rule-based observation from their recorded data.
  - High tannin + full body + dark color → *"Classic hallmarks of a warm-climate red like Cabernet Sauvignon or Syrah."*
  - Does not require AI — can be logic-driven from the saved taste dimension values.
- **WineDetail "What this tells you" section:** A collapsed section that interprets tasting notes.
  - High acidity + herbal aromas + light body → *"These are classic markers of a cool-climate white, like Sauvignon Blanc or Grüner Veltliner."*
- **Aroma-to-wine-character tooltips:** Info icon next to aroma names on the selection screens.
  - "Vanilla" → *"Vanilla and toast aromas often indicate aging in oak barrels."*
  - This is exactly the vocabulary-building moment educators spend class time on.

**Effort:** Medium — rule-based logic, no AI required.

---

## 3. Guided Learning in the Wine Tasting Guide

**Goal:** Make the guide an active teaching tool, not just a static reference.

Currently the Wine Tasting Guide is a single read-only screen. It could become modular and actionable.

- Break content into **short scannable modules**: "How to Look," "How to Smell," "Understanding Tannin," "What Acidity Does," etc.
- Add a **"Try It" button** at the end of each module that starts a tasting flow with that step's prompts emphasized. Read about acidity → immediately do an acidity-focused tasting.
- Add **grape variety profiles** and **region profiles** as mini-encyclopedia entries. When a user selects a grape in BasicInfo, link to a Cabernet Sauvignon profile (*"expect high tannin, black fruit, often oak-aged"*) so they have a prediction to test against their nose.

**Effort:** Medium — requires new content structure and profile data.

---

## 4. Pattern Recognition Across Saved Tastings

**Goal:** Help learners discover their own palate, which builds purchase confidence.

After 10–20 wines, a learner has real data. The app doesn't surface it yet.

- **"My Palate" section in My Profile:**
  - Most common aromas detected
  - Average acidity / body / tannin preferences
  - Most tasted grapes and countries
  - "You tend to rate [white wines] higher" — simple but revelatory.
- **Preference trends:** *"Your last 10 wines rated 8+ all had high acidity."* — connects tasting skill to purchase confidence.
- **"Wines similar to your favorites" suggestions:** Rule-based.
  - "You loved this Chablis — other high-acidity, light-body whites to explore: Albariño, Vermentino, Grüner Veltliner."
  - No ML required, just a flavor-profile lookup table.

**Effort:** Medium — requires aggregation logic over saved wines.

---

## 5. Side-by-Side Comparison

**Goal:** Let learners see differences between wines concretely, not just feel them abstractly.

Flight data is already collected but not analyzed after completion.

- **Flight debrief view in CompletedFlightDetail:** A comparison table showing all wines in the flight side-by-side across the 6 taste dimensions. This is exactly what you'd draw on a whiteboard in a class.
- **"Compare two wines" in My Tastings:** Select any two wines from the list and view them side by side. Useful for answering *"why did I like this one more than that one?"*

**Effort:** Medium — new UI component, data already exists.

---

## 6. Vocabulary Scaffolding for Beginners

**Goal:** Remove the intimidation factor of professional terminology.

The aroma and taste screens use sommelier vocabulary without explanation. This creates a barrier for new tasters.

- **Beginner / Expert toggle (setting):** Switches aroma labels between plain language (*"earthy, musty"*) and professional terms (*"petrichor, sous bois"*). Beginners pick the familiar word; they learn the pro term is equivalent.
- **Progressive disclosure:** On first use, show brief inline definitions. After several tastings, collapse them automatically.
- **"I'm not sure" option on taste scales:** Let users flag a dimension as uncertain instead of forcing a guess. Over time, the app shows which dimensions they consistently flag — helping an educator see where to focus teaching.

**Effort:** Medium — requires a beginner mode setting and alternate label data.

---

## 7. Educator-Specific Tooling

**Goal:** Acknowledge the educator use case directly.

There is currently no tooling that supports running a class or group session.

- **Group flight / class session mode:** Create a session that students can join via QR or link, then taste independently on their own devices against the same flight structure. Aligns directly with the winery partner infrastructure already built.
- **Flight template library:** Pre-built educational flights (e.g., "Classic Old World Reds," "Acidity Contrast Flight," "Tannin Spectrum") that an educator can start from. Each wine in the flight already has a `description` field for educator notes.
- **Facilitator notes surfaced more prominently:** The `FlightWine.description` field already exists and renders as "winery notes" in GuidedSession. Making it more prominent (not collapsed) during the tasting gives learners a teaching cue before they smell.
- **Export / share a flight summary:** After a class session, generate a shareable text or PDF summary — flight name, wines, and key tasting notes — so students leave with something concrete.

**Effort:** High (group session) to Low (surfacing existing description field).

---

## Priority Summary

| Priority | Area | Effort |
|---|---|---|
| High | Contextual coaching hints during tasting (tap-to-reveal) | Low |
| High | Aroma "what this tells you" tooltips | Low |
| High | Post-save insight card (rule-based interpretation) | Medium |
| Medium | "My Palate" stats in Profile | Medium |
| Medium | Flight debrief comparison table | Medium |
| Medium | Grape / region profiles linked from BasicInfo | Medium |
| Medium | Beginner vocabulary toggle | Medium |
| Lower | Wine similarity suggestions | Medium |
| Lower | "Try It" buttons in Tasting Guide | Low |
| Lower | Educator group / class session mode | High |
