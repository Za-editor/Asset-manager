import { Suspense } from "react";
import { Loader2, Tag } from "lucide-react";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAssetByIdAction } from "@/actions/dashboard-actions";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface GalleryDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

function GalleryDetailsPage({ params }: GalleryDetailsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[65vh]">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
        </div>
      }
    >
      <GalleryContent params={params} />
    </Suspense>
  );
}

export default GalleryDetailsPage;

async function GalleryContent({ params }: GalleryDetailsPageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.role === "admin") {
    redirect("/");
  }

  const result = await getAssetByIdAction(id);

  if (!result) {
    notFound();
  }

  const { asset, categoryName, userName, userImage, userId } = result;

  const isAuthor = session?.user.id === userId;

  const initials = userName
    ? userName
        .split("")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen container px-4 bg-white">
      <div className="container py-12">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <div className="rounded-lg overflow-hidden bg-gray-100 border">
              <div className="relative w-full">
                <Image
                  src={asset.fileUrl}
                  alt={asset.title}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{asset?.title}</h1>
                {categoryName && (
                  <Badge className="mt-2 bg-gray-200 text-gray-700 hover:bg-gray-300">
                    <Tag className="mr-1 h-4 w-4" />
                    {categoryName}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">Right</div>
        </div>
      </div>
    </div>
  );
}
