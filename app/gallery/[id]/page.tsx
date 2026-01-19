
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAssetByIdAction } from "@/actions/dashboard-actions";



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

    const { asset, categoryname, userName, userImage, userId } = result
    
    const isAuthor = session?.user.id === userId

    const initials = userName? userName.split("").map((n) => n[0]).join("").toUpperCase(): "U"

  return <div className="min-h-screen container px-4 bg-white">
      <div className="container py-12">
          <div className="grid gap-12 md:grid-cols-3">
              <div className="md:col-span-2 space-y-8">
                  <div className="space-y-6"></div>
              </div>
          </div>
    </div>
  </div>;
}
