/** A whole page in one script, shown under the syntax reference. */
export const HOMEPAGE_EXAMPLE = `# Without this line the blocks below are added to
# whatever page is already open, and running the script
# twice adds them twice.
start a new page

# Hero
add a Container called hero with gap of 16
inside hero, add a Heading 1 that says "Community Darkroom"
inside hero, add a Paragraph that says "A home for film photographers to share prints, trade notes, and find a darkroom to borrow."
inside hero, add a Button called heroCta that says "Join now"
give heroCta style of "Solid"

# Two cards side by side
add a Container called cardRow with direction of "Across the page", gap of 24
inside cardRow, add a Container called card1 with gap of 8
inside card1, add a Heading 3 that says "Community darkrooms"
inside card1, add a Paragraph that says "Find a shared darkroom near you."
inside cardRow, add a Container called card2 with gap of 8
inside card2, add a Heading 3 that says "Print swaps"
inside card2, add a Paragraph that says "Trade prints with other members."

# An alert
add an Alert that says "New: weekend darkroom slots just opened up." with kind of "Information"

# Styling
make a style called "hero-panel" with background of "#1a1a1a", padding of 32
apply "hero-panel" to hero

# Where it lives
publish this as "Home" at /`
