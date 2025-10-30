
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function RosterPage() {
  return (
    <>
      <PageHeader
        title="Weekly Roster"
        description="View and manage the employee schedule for the current week."
      />
      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
          <CardDescription>
            This feature is currently being built.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
          <Construction className="w-16 h-16 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Feature Coming Soon!</h3>
            <p className="text-muted-foreground">
              We are working hard to bring you the weekly roster.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
