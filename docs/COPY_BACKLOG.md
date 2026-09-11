# Copy backlog — what we still need

Everything the SYNC quiz needs that `The Quiz — Copy Layer v2.1` marks as unwritten.
The doc names Amelia for the card copy and Reid for the associative framing.

This is not a list of things we could not find. It is the list the copy layer itself
raises — §5.2 says "Amelia to write the remaining 4 base paragraphs … and the 4 benefit
chips per compound", §5.3 says "Copy per supporting protocol pairing to be written", and
§5.6 says the same for the pairings.

**Nothing here has been drafted on our side.** These are therapeutic claims about
compounded 503A molecules, and the copy layer records that Reid signs the framing and
Amelia signs the paragraphs. Writing stand-ins would put unsigned medical claims in front
of a customer. The build renders a visible "copy pending" state instead, so a gap looks
like a gap.

Everything else in the quiz is complete: all fifteen screens, all five branches, every
option, every education panel, every recognition line, and all ten reveal reads are
transcribed and in the build.

---

## 1 · Benefit chips + base paragraph — 3 blends

The REPAIR base card is written and in the build as the worked example. These three are not.

| Base                                     | Needs                              |
| ---------------------------------------- | ---------------------------------- |
| PERFORM (CJC-1295 · Ipamorelin)          | 4 benefit chips + 3-line paragraph |
| DEFINE (AOD-9604 · MOTS-c · Tesamorelin) | 4 benefit chips + 3-line paragraph |
| RESTORE (GHK-Cu · Epitalon)              | 4 benefit chips + 3-line paragraph |

## 2 · Benefit chips + paragraph — 14 single compounds

NAD+ is written as the worked supporting-protocol example. The rest are not.

`BPC-157` · `TB-500` · `KPV` · `GHK-Cu` · `Epitalon` · `Sermorelin` · `CJC-1295` ·
`Ipamorelin` · `AOD-9604` · `Tesamorelin` · `MOTS-c` · `PT-141`

Plus the GLP-1 continuation card (`Semaglutide` / `Tirzepatide`), which is a different
situation to the others: the customer is **already on** a GLP-1, and §3 resolves the
molecule at intake rather than in the quiz. That card is telling someone their current
medication is the maintenance path, so it likely needs its own voice rather than a
product pitch.

## 3 · Pairs-well-with one-liners — 4

The pairings are locked in Backend §4A; the clinical reason line for each is outstanding.
These only ever appear on a solo blend (Shape 2).

| Base    | Pairs with | Needs                    |
| ------- | ---------- | ------------------------ |
| REPAIR  | NAD+       | one-line clinical reason |
| PERFORM | MOTS-c     | one-line clinical reason |
| DEFINE  | BPC-157    | one-line clinical reason |
| RESTORE | NAD+       | one-line clinical reason |

## 4 · Prices — the whole table

Every price in the copy layer is a `$X` placeholder. The only real figures we have came
off the confirmed Figma reveal frames, and they cover the Recovery lane only:

| Item             | Price           |
| ---------------- | --------------- |
| BPC-157 (single) | $225.00 / month |
| REPAIR blend     | $340.00 / month |
| TB-500 (adjunct) | $185.00 / month |
| Deep Rest        | $65.00 / month  |

We need every other base and adjunct priced — **and the plan-length model.** §5.4 requires
a specific figure at 1, 3 and 6 months, with the running total updating live, and §5.4 is
explicit that these are exact prices rather than "starting from". A single monthly price
per compound is not enough to build that: we need to know how 1 / 3 / 6 month plans
differ. This blocks the reveal's running total and sticky footer.

## 4b · The read needs a headline and a second paragraph

The reveal's read band is drawn as an eyebrow, a **29px headline**, **two** body
paragraphs and a footer. The copy layer gives each of the ten read variants a **single
paragraph** and no headline.

So ten headlines and ten second paragraphs do not exist. The build sets the signed
paragraph as a lead paragraph and omits the headline rather than inventing associative
clinical claims — these are the lines the copy layer records Reid as signing. The frame's
own example ("You are not under-recovering. You are under-signalling.") is not one of the
ten variants and is not in the copy layer at all.

## 5 · Words that appear only in the design

Found while building the quiz screens in Phase 4. These are in the confirmed frames but
nowhere in the copy layer, so they have never been through copy review. They are in the
build because the frames are the newer artefact — but somebody should own them.

| Screen               | Line                                                    |
| -------------------- | ------------------------------------------------------- |
| S5 / S7 lane options | `Fat, definition, plateau` (Change my body composition) |
| S5 / S7 lane options | `Desire and response` (Sex drive and arousal)           |
| S1 welcome           | `About two minutes · No card required`                  |
| Branch education     | `No product mentioned on this screen — education only.` |
| Branch education     | The `WHY WE ASKED` eyebrow                              |
| Recognition callouts | The `WE SEE THIS OFTEN` eyebrow                         |
| S2 name              | The `First name` field label                            |
| S9 email             | The `Email address` field label                         |

The two field labels were added in the second design-review pass — the copy layer has no
field labels at all, and the frames label S2 and S9 while leaving S8C's textarea bare.

**S3 is a related but different case.** The copy layer gives it as one sentence,
`Welcome, [name]. Two minutes — let's see what fits.`; the frame sets it as a 34px
greeting with an 18px sub-line beneath. The build splits the sentence at its full stop, so
the words are the copy layer's and only the typesetting is the frame's. Flagged here in
case the split is not what was intended — a test asserts the two halves rejoin into the
signed sentence exactly.

The lane subtitles are the notable ones: three of the five are just the copy layer's line
split at its em dash, but those two are new sentences. The last one is also a compliance-
adjacent claim about the screen's own content, which is exactly the kind of line that
should be signed rather than inherited from a mockup.

---

## Two questions that change the size of this list

**1 · Are the card paragraphs written per compound, or per answer pattern?**

§5.2 asks for "a 3-line paragraph tying the compound to the customer's **specific
answers**", and the worked example opens "You told us the recovery is showing up in your
gut and something structural" — copy for one particular answer combination, not for
REPAIR in general.

Read one way this is ~17 paragraphs, one per protocol. Read the other way it is one per
protocol _per answer pattern_, which is a much larger job and needs a templating approach
rather than fixed strings. We have modelled one per protocol. Worth settling before
Amelia starts, because the two are very different amounts of work.

**2 · Should the reveal cards differ between base and supporting position?**

NAD+ currently has one card, written as a supporting protocol ("Paired with REPAIR, it
means the repair machinery has something to work with"). But NAD+ is also a _base_ result
in its own right — Lane D returns it for `cellular_energy` alone. That paragraph does not
work as a base card. Either NAD+ needs two paragraphs, or they need to be written so
position does not matter.

The same applies to BPC-157, MOTS-c, Sermorelin and GHK-Cu, all of which appear in both
positions depending on the path.

---

## How this is tracked in code

`lib/shared/content/compounds.content.ts` holds each protocol's copy as either
`{ status: 'written', … }` or `{ status: 'pending', awaiting: … }`. It is a discriminated
union on purpose: a component cannot render pending copy as though it were signed without
handling the case explicitly.

`tests/unit/content.test.ts` asserts the exact set that is still pending, so copy landing
shows up as a failing test naming what changed rather than a silent pass — and so nobody
can flip a marker to `written` without supplying real words.
