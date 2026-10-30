import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/article-detail";
import { EmptyState } from "@/components/ui/primitives";
import { getDbOrNull } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getArticleBySlug, getRelatedArticles, getSavedArticleIds } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDbOrNull();
  if (!db) return { title: "Travel guide" };
  const article = await getArticleBySlug(db, slug).catch(() => null);
  if (!article || article.type !== "guide") return { title: "Travel guide not found" };
  return {
    title: article.title,
    description: article.excerpt.slice(0, 158),
    alternates: {
      canonical: `/travel-guides/${article.slug}`,
      languages: {
        "en-BD": `/travel-guides/${article.slug}`,
        "bn-BD": `/travel-guides/${article.slug}?lang=bn`,
      },
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt.slice(0, 158),
      url: absoluteUrl(`/travel-guides/${article.slug}`),
      images: article.heroImage ? [{ url: article.heroImage }] : undefined,
    },
  };
}

export default async function TravelGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <div className="page py-16">
          <EmptyState title="The database is not connected" description="Apply the migration and seed data, then reload." />
        </div>
      </main>
    );
  }

  const article = await getArticleBySlug(db, slug);
  if (!article || article.type !== "guide") notFound();
  const [related, user] = await Promise.all([getRelatedArticles(db, article, 3), getCurrentUser().catch(() => null)]);
  const savedIds = user ? await getSavedArticleIds(db, user.id).catch(() => new Set<string>()) : new Set<string>();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: article.author },
    publisher: { "@type": "Organization", name: "Discover Bangladesh AI" },
    image: article.heroImage ?? undefined,
    mainEntityOfPage: absoluteUrl(`/travel-guides/${article.slug}`),
    inLanguage: "en",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleDetail
        article={article}
        related={related}
        basePath="/travel-guides"
        baseLabel="Travel guides"
        initiallySaved={savedIds.has(article.id)}
      />
    </>
  );
}
