import { ComingSoonPlaceholder } from "@/components/shared/ComingSoonPlaceholder";

// Placeholder homepage content — the real hero, card grids, and
// Editor's Picks module are built in Step 5. This page exists in Step
// 3 solely to prove the Navbar/Footer shell renders and behaves
// correctly at every breakpoint.
export default function Home() {
  return (
    <ComingSoonPlaceholder
      step="Coming in Step 5"
      title="The homepage content lands next."
      description="This placeholder exists to verify the navigation shell — sticky navbar, mobile drawer, and footer — before the real hero and article grids are built."
    />
  );
}
