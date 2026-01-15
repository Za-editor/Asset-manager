"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus, Upload } from "lucide-react";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Category = {
  id: number;
  name: string;
  createdAt: Date;
};

interface UploadDialogProps {
  categories: Category[];
}

function UploadAsset({ categories }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-500 hover:bg-teal-600 text-white">
          <Plus className="mr-2 w-4 h-4" />
          Upload Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:maw-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload New Asset</DialogTitle>
          
        </DialogHeader>
        <form action="" className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
<Input type="file" id="file" accept="image/*" />
          </div>
          <DialogFooter>
            <Button type="submit">
              <Upload className="mr-2 h-5 w-5" />
              Upload Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UploadAsset;
