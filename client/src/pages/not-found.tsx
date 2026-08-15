import { Link } from "wouter";
import { Zap, ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageLayout>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
        <span className="font-mono text-sm text-primary">ERROR 404</span>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-muted-foreground">This page shorted out. Let's get you back on a charged path.</p>
        <div className="mt-6 flex gap-2">
          <Link href="/"><Button className="gap-2"><Zap className="size-4" /> Back home</Button></Link>
          <Link href="/finder"><Button variant="outline" className="gap-2"><ArrowLeft className="size-4" /> Find a battery</Button></Link>
        </div>
      </div>
    </PageLayout>
  );
}
