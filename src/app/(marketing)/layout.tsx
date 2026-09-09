import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { getRecentArticles } from "@/lib/queries/articles";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const recent = await getRecentArticles(9);
  const latest = recent.slice(0, 4);
  const featured = recent[4] ?? null;
  const suggestions = recent.slice(5, 9);

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer latest={latest} featured={featured} suggestions={suggestions} />
    </>
  );
}
