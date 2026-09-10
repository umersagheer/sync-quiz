import type { DiscriminatorSignal, Lane } from '../types/quiz.types'
import type { BranchContent, RecognitionRule } from '../types/content.types'

/**
 * Section 3 — the five discriminator branches, transcribed verbatim.
 *
 * Exactly one branch fires per customer, matched to the S5 lane. Each is a discriminator
 * screen, a qualifier screen, and an education screen that closes the branch.
 *
 * Recognition lines are same-screen callouts with real firing conditions, and most
 * branches define a primary line plus alternate beats for other answer shapes. Several
 * combinations deliberately fire nothing at all — Branch A stays silent on a single box.
 * Rules are ordered and the first match wins.
 */

const has = (signals: DiscriminatorSignal[], signal: DiscriminatorSignal) =>
  signals.includes(signal)

const REPAIR: BranchContent = {
  lane: 'REPAIR',
  title: 'Recovery',
  discriminator: {
    select: 'multi',
    heading: "Where's the recovery problem showing up?",
    body: 'Tick everything that fits. Most people have more than one.',
    options: [
      {
        value: 'localised_soft_tissue',
        label: "A specific injury or tendon that should've healed by now",
      },
      { value: 'gut_mucosal', label: 'Gut — bloating, reactivity, the way food sits' },
      { value: 'connective_skin', label: 'Skin — small cuts, wear, things heal slowly' },
      { value: 'systemic_multisite', label: "Everywhere — I don't repair the way I used to" },
    ],
  },
  qualifier: {
    heading: 'Is there active inflammation right now?',
    body: "Heat, swelling, or a flare that won't settle.",
    options: [
      { value: 'inflammatory_active', label: 'Yes, right now' },
      { value: 'inflammatory_intermittent', label: 'Comes and goes' },
      { value: 'mechanical', label: "No — it's more wear-and-tear" },
    ],
  },
  recognition: [
    {
      id: 'gut_plus_structural',
      text: 'If you ticked gut and something structural — those usually track together. Gut and tissue repair share the same underlying pathway.',
      when: (signals) =>
        has(signals, 'gut_mucosal') &&
        (has(signals, 'localised_soft_tissue') || has(signals, 'systemic_multisite')),
    },
    {
      id: 'multi_site',
      text: 'Multi-site is the more common presentation, and the more informative one for a clinician.',
      when: (signals) => signals.length >= 2,
    },
    // No recognition on a single box — deliberate, per the build note.
  ],
  education: {
    heading: "Why recovery isn't one problem.",
    body: [
      'Your gut and your soft tissue heal through the same repair pathway.',
      "When one is inflamed, the other slows down. That's why gut issues and an injury that won't heal aren't two separate problems in the same body — they're the same process, showing up in different places.",
    ],
    cta: 'Keep going',
  },
}

const PERFORM: BranchContent = {
  lane: 'PERFORM',
  title: 'Performance',
  discriminator: {
    select: 'multi',
    heading: "What's changed in your training or performance?",
    body: "Tick everything that's true.",
    options: [
      {
        value: 'recovery_lag',
        label: 'Recovery between sessions — I need more time than I used to',
      },
      { value: 'body_comp_stall', label: 'Same effort, worse output — results stopped showing up' },
      { value: 'sleep_gh', label: "Sleep isn't recovering me the way it should" },
      { value: 'multidomain_decline', label: "There used to be another gear — it's gone" },
    ],
  },
  qualifier: {
    heading: 'How hard are you training right now?',
    options: [
      { value: 'load_light', label: 'Light' },
      { value: 'load_moderate', label: 'Moderate' },
      { value: 'load_high', label: 'High' },
      { value: 'load_elite', label: 'Elite or competitive' },
    ],
  },
  recognition: [
    {
      id: 'system_shift',
      text: "Ticking more than one isn't \"train harder.\" It's a shift in the system that drives recovery — and it's the pattern a clinician looks for specifically.",
      when: (signals) => signals.length >= 2 || has(signals, 'multidomain_decline'),
    },
    {
      id: 'recovery_lag_alone',
      text: 'Recovery lag on its own is the clearest signal to work with — one variable, clean read at 90 days.',
      when: (signals) => signals.length === 1 && has(signals, 'recovery_lag'),
    },
  ],
  education: {
    heading: 'Why "train harder" stops working.',
    body: [
      'Growth hormone drives most of your recovery — and from your mid-30s, your body releases less of it. Less recovery signal means the same training leaves you deeper in the hole each time.',
      "The answer stops being effort. It's the system doing the recovering that's changed.",
    ],
    cta: 'Keep going',
  },
}

const DEFINE: BranchContent = {
  lane: 'DEFINE',
  title: 'Body composition',
  discriminator: {
    // Single-select — "the pinch test". `mixed` is how this lane expresses two patterns,
    // which is why Backend's Lane C "2+ boxes" row can never fire.
    select: 'single',
    heading: 'Pinch the fat around your middle. What is it?',
    body: "This question separates the compounds that work for your kind of fat from the ones that don't.",
    options: [
      { value: 'subcutaneous', label: 'Soft — I can grab a handful' },
      { value: 'visceral', label: 'Firm and deep — sits tight, hard to pinch' },
      { value: 'mixed', label: 'Both, depending where' },
      { value: 'metabolic_slowdown', label: "It's not the fat — the whole system feels flat" },
    ],
  },
  qualifier: {
    heading: 'Have you used a GLP-1 medication?',
    body: 'Ozempic, Wegovy, Mounjaro, or compounded semaglutide.',
    options: [
      { value: 'glp1_naive', label: 'Never' },
      { value: 'glp1_active', label: 'On one now' },
      { value: 'glp1_rebound', label: 'I stopped, and regained' },
    ],
  },
  recognition: [
    {
      id: 'visceral_or_mixed',
      text: "If you got firm and deep — that's visceral fat. It responds to different biology than the soft kind. Same person can carry both. Different treatments.",
      when: (signals) => has(signals, 'visceral') || has(signals, 'mixed'),
    },
    {
      id: 'subcutaneous',
      text: 'Soft fat is the more common presentation and the one most protocols are actually built for.',
      when: (signals) => has(signals, 'subcutaneous'),
    },
    {
      id: 'metabolic_slowdown',
      text: "That's a systemic read, not a fat read — different lane, different answer.",
      when: (signals) => has(signals, 'metabolic_slowdown'),
    },
  ],
  education: {
    heading: "Why one kind of fat responds and the other doesn't.",
    body: [
      'Soft fat — the kind you can pinch — sits under the skin and responds to calorie balance.',
      "Firm, deep fat sits around your organs and behaves differently. It's driven by stress hormones and how your body handles blood sugar, not by how much you eat.",
      'Same person can carry both. Different biology. Different levers.',
    ],
    cta: 'Keep going',
  },
}

const RESTORE: BranchContent = {
  lane: 'RESTORE',
  title: 'Skin & longevity',
  discriminator: {
    select: 'multi',
    heading: 'What made you first think something had changed?',
    body: 'Tick anything that fits.',
    options: [
      { value: 'skin_visible', label: 'My skin stopped looking like mine' },
      { value: 'circadian', label: 'Sleep and body clock feel off' },
      { value: 'cellular_energy', label: "The energy I used to take for granted just isn't there" },
      { value: 'broad_healthspan', label: 'All of it, and it crept up faster than I expected' },
    ],
  },
  qualifier: {
    heading: "How's your sleep rhythm?",
    options: [
      { value: 'rhythm_solid', label: 'Solid — I sleep through and wake rested' },
      { value: 'rhythm_broken', label: "Falls apart at night — I wake up and can't settle" },
      { value: 'rhythm_shifted', label: 'Off since a shift, travel, or getting older' },
      { value: 'rhythm_fine', label: 'Fine — not my issue' },
    ],
  },
  recognition: [
    {
      id: 'overlapping_clocks',
      text: 'Skin, sleep and energy look like three separate complaints. They run on overlapping clocks — which is why they usually shift together.',
      when: (signals) => signals.length >= 2 || has(signals, 'broad_healthspan'),
    },
    {
      id: 'skin_visible_alone',
      text: 'Skin-visible on its own is the cleanest presentation to work with — one lane, one signal.',
      when: (signals) => signals.length === 1 && has(signals, 'skin_visible'),
    },
    {
      id: 'cellular_energy_alone',
      text: 'Energy-only is the cleanest read — one system to work with.',
      when: (signals) => signals.length === 1 && has(signals, 'cellular_energy'),
    },
  ],
  education: {
    heading: 'Why skin, sleep and energy shift together.',
    body: [
      "They run on the same internal clock. When your body's repair rhythm slows, skin turnover slows with it — texture, tone, how fast wear heals.",
      "That's why the person whose sleep drops usually notices their skin next, then their energy. They shift together because they run on the same signal.",
    ],
    cta: 'Keep going',
  },
}

const PT141: BranchContent = {
  lane: 'PT141',
  title: 'Sex drive and arousal',
  // Qualifier only, no discriminator. R6 — this lane returns a single always.
  discriminator: null,
  qualifier: {
    heading: "What's actually changed for you?",
    body: 'Desire and arousal have different drivers. It matters which one shifted.',
    options: [
      { value: 'desire', label: "The desire itself — the wanting isn't there" },
      { value: 'arousal', label: 'Response is lagging behind the interest' },
      { value: 'both', label: 'Both' },
    ],
  },
  recognition: [
    {
      id: 'desire_vs_arousal',
      text: 'Desire and arousal have different drivers. Most people are never asked to separate them — that distinction is the read.',
      when: () => true,
    },
  ],
  education: {
    heading: 'Why desire and response are two different things.',
    body: [
      'Desire is a signal from the brain — the wanting.',
      'Response is what the body does with it — blood flow, hormones, physical readiness.',
      'They can shift independently. And they respond to different treatments.',
    ],
    cta: 'Keep going',
  },
}

export const BRANCHES: Record<Lane, BranchContent> = {
  REPAIR,
  PERFORM,
  DEFINE,
  RESTORE,
  PT141,
}

/**
 * The recognition line for a branch, or null when the answers deliberately fire none.
 * First matching rule wins.
 */
export const resolveRecognition = (
  lane: Lane,
  signals: DiscriminatorSignal[],
): RecognitionRule | null => BRANCHES[lane].recognition.find((rule) => rule.when(signals)) ?? null
