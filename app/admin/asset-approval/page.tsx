import {
  approveAssetAction,
  getpendingAssetsAction,
  rejectAssetAction,
} from "@/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

async function AssetApprovalPage() {
  const pendingAssets = await getpendingAssetsAction();
  const list = pendingAssets ?? [];

  if (list.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="py-16 flex flex-col items-center justify-center">
          <p className="text-center text-slate-50-0 text-lg">
            All Assets have been reviewed
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ">
        {list.map(({ asset, userName }) => (
          <div
            key={asset.id}
            className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow transition-shadow"
          >
            <div className="h-48 bg-slate-100 relative">
              <Image
                src={asset.fileUrl}
                alt={asset.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                {userName && <Badge>{userName}</Badge>}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium truncate">{asset.title}</h3>
              {asset.description && (
                <p className="text-xs text-slate-500">{asset.description}</p>
              )}
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-slate-200">
                  {formatDistanceToNow(new Date(asset.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                <div className="flex items-center text-xs text-slate-400">
                  <User className="mr-2 w-4 h-4" />
                  {userName}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4">
              <form
                action={async () => {
                  "use server";
                  await approveAssetAction(asset.id);
                }}
              >
                <Button className="bg-teal-500 hover:bg-teal-600">
                  Approve
                </Button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await rejectAssetAction(asset.id);
                }}
              >
                <Button className="bg-red-500 hover:bg-red-600">Reject</Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssetApprovalPage;
