import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Eye, Settings } from "lucide-react";

const ContentManagement = () => {
  const pages = [
    { id: 1, title: "About Us", slug: "about", status: "published", lastModified: "2024-01-15" },
    { id: 2, title: "Our Mission", slug: "mission", status: "published", lastModified: "2024-01-10" },
    { id: 3, title: "Contact Information", slug: "contact", status: "published", lastModified: "2024-01-12" },
    { id: 4, title: "Privacy Policy", slug: "privacy", status: "draft", lastModified: "2024-01-14" },
    { id: 5, title: "Terms of Service", slug: "terms", status: "draft", lastModified: "2024-01-13" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Website Content</h1>
          <p className="text-gray-600">Manage pages & information on the website</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Card key={page.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  {page.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Last Modified: {page.lastModified}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
