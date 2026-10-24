# PetVerse: The Lost Starseed - Design Spec

Approved creative direction. Keep this concise and actionable; balance numbers live in src/data/config.js, never here.

## Core premise

The floating islands of PetVerse are losing their glow. The player finds a dimmed Starter Sanctuary, awakens a Spirit Pet, and restores Starseed Light by caring for pets. Light feeds the shrine crystal at the island's heart; as it grows, the island literally brightens. Coins earned from care buy eggs; hatched pets raise the island's light further and eventually awaken new islands.

## Core loop

Care actions (Feed / Play / Clean) -> stats + Starseed Light + coins -> spend coins in the Egg Shop -> hatch pets -> collection grows -> island glow rises -> unlock the next island.

## FTUE (first 5 minutes)

Implemented as a 3-step, skippable intro overlay (saved flag: hasSeenIntro):
1. A dim island - the islands have lost their glow.
2. A spirit stirs - your first Spirit Pet awakens; care actions gather Starseed Light.
3. Restore the light - every caring act feeds the shrine crystal.

Returning players never see it again.

## The three starter Spirit Pets

All buildable from primitives (spheres, cones, capsules, torus). One palette, three silhouettes.

1. Lumipup (Ember) [Implemented - current pet, warm palette]
   - Silhouette: round warm body, tall cone ears, snout.
   - Palette: warm orange body #ffb347, cream snout.
   - Personality: warm, energetic, bouncy.
   - Animation signature: hop with squash-stretch, quick nods, eager blinks, ear twitches.

2. Dewdrop (Aqua-Sprout) [Planned]
   - Silhouette: droplet-shaped body (sphere squashed top), small leaf cone on head, stubby flippers.
   - Palette: aqua green #7fd8be with pale belly.
   - Personality: calm, gentle, floaty.
   - Animation signature: slow vertical bob/sway, no hops; drips sparkle when happy.

3. Starling (Astral) [Planned]
   - Silhouette: small round body, two curved antenna-tori, star gem on forehead.
   - Palette: deep violet #8e7cf0 with glowing white star accents.
   - Personality: curious, attentive.
   - Animation signature: ear/antenna twitches, slow curious head tilts, glowing accents pulse with island light.

## Eggs and rarity [Planned]

- Common Egg: 30 coins, hatches Lumipup (80%) or Dewdrop (20%). Hatch time 5 min.
- Rare Egg: 90 coins, hatches any starter with raised rare color variants. Hatch time 20 min.
- Starseed Egg: 250 coins, hatches Starling (plus future species). Hatch time 60 min.

Exact numbers go into config.js when the Egg Shop milestone starts.

## Islands [Planned]

- Starter Sanctuary (live): grassy disc, stone shrine, floating light motes; brightness scales with Starseed Light.
- Verdant Hollow: forest theme, unlocked at 100 Starseed Light.
- Tidal Reach: water theme, unlocked by collection size (Phase 5+).

## Storytelling rules

- No lore dumps. Narrative = 1-2 line dialogue toasts at discovery moments.
- Environmental storytelling: island lighting, crystal glow, and mote brightness rise with Starseed Light.
- Discovery milestones (first hatch, first rare pet, island awakening) get a single toast + light burst.

## Accessibility

- prefers-reduced-motion respected by default; in-game toggle overrides (body.reduced-motion).
- All touch targets at least 48x48px; safe-area insets respected.
- Audio is optional, synthesized (Web Audio), and mutable; no audio is required to play.
