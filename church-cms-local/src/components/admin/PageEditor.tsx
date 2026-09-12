import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface PageEditorProps {
  page?: {
    id: string;
    title: string;
    content: string;
    status: string;
    lastModified: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (pageData: any) => void;
}

const PageEditor = ({ page, isOpen, onClose, onSave }: PageEditorProps) => {
  const [title, setTitle] = useState(page?.title || "");
  const [content, setContent] = useState(page?.content || "");
  const [status, setStatus] = useState(page?.status || "draft");

  const handleSave = () => {
    const pageData = {
      id: page?.id || Date.now().toString(),
      title,
      content,
      status,
      lastModified: "just now"
    };
    onSave(pageData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{page ? "Edit Page" : "Create New Page"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Page Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter page content (supports HTML)"
              className="min-h-[300px]"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="elegant" onClick={handleSave}>
              {page ? "Update Page" : "Create Page"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageEditor;