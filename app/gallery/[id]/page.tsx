import { Suspense } from "react";
import { Download, Info, Loader2, ShoppingCart, Tag } from "lucide-react";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAssetByIdAction } from "@/actions/dashboard-actions";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createStripeCheckoutSession } from "@/actions/payment-actions";


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

  const { asset, categoryName, userName, userId } = result;

  const isAuthor = session?.user.id === userId;

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const hasPurchasedAsset = false;

async function handlePurchase() {
  "use server";

  const result = await createStripeCheckoutSession((await params).id);
  if (result.alreadyPurchased) {
    redirect(`/gallery/${(await params).id}?success=true`);
  }
  if (result.checkoutUrl) {
    redirect(result.checkoutUrl);
  }
}
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image */}
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm border">
              <div className="relative max-h-[75vh] flex items-center justify-center bg-gray-100">
                <Image
                  src={asset.fileUrl}
                  alt={asset.title}
                  width={1200}
                  height={800}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Title + Meta */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight">
                  {asset?.title}
                </h1>

                {categoryName && (
                  <Badge className="mt-3 inline-flex items-center gap-1 bg-gray-200 text-gray-700 hover:bg-gray-300">
                    <Tag className="h-4 w-4" />
                    {categoryName}
                  </Badge>
                )}
              </div>

              {/* Creator */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-gray-500">Creator</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="overflow-hidden border-0 shadow-lg rounded-xl py-0 gap-0">
              <div className="bg-linear-to-r from-gray-900 to-gray-800 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Premium Asset</h3>
                <div>
                  <span className="text-3xl font-bold">$5.00</span>
                  <span className="ml-2 text-gray-300">One time purchase</span>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {session?.user ? (
                    isAuthor ? (
                      <div className="bg-blue-50 text-blue-700 p-5 rounded-lg flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                        <p className="text-sm">
                          This is your own asset. You cant purchase your on
                          asset
                        </p>
                      </div>
                    ) : hasPurchasedAsset ? (
                      <Button
                        asChild
                        className="w-full bg-green-600 text-white h-12"
                      >
                        <a download>
                          <Download className="mr-2 w-6 h-6" />
                          Download Asset
                        </a>
                      </Button>
                    ) : (
                      <form action={handlePurchase}>
                        <Button
                          type="submit"
                          className="w-full bg-black text-white h-12"
                        >
                          <ShoppingCart className="mr-2 w-6 h-6" />
                          Purchase Now
                        </Button>
                      </form>
                    )
                  ) : (
                    <>
                      <Button
                        asChild
                        className="w-full bg-black text-white h-12"
                      >
                        <Link href="/login">Sign in to purchase</Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
