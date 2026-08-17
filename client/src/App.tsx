import { Router } from "wouter";
import { useEffect } from "react";
import { useHashPath } from "./lib/use-hash-path";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { CartProvider } from "@/context/cart-context";
import { ChatWidget } from "@/components/chat-widget";
import { HomePage } from "@/pages/home";
import { FinderPage } from "@/pages/finder";
import { StorePage } from "@/pages/store";
import { ProductPage } from "@/pages/product";
import { CartPage } from "@/pages/cart";
import { CheckoutPage } from "@/pages/checkout";
import { RepairPage } from "@/pages/repair";
import { TrackRepairPage } from "@/pages/track-repair";
import { AppointmentsPage } from "@/pages/appointments";
import { ContactPage } from "@/pages/contact";
import { PartsPage } from "@/pages/parts";
import { AdminPage } from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { useSeo } from "@/lib/use-seo";

function seoForPath(path: string) {
  if (path === "/") return {
    title: "Jolt Revive | E-Bike & E-Scooter Battery Repair in the Bronx",
    description: "Bronx, NYC lithium-ion battery diagnostics, repair, rebuilding, and replacement for e-bikes, e-scooters, e-motorcycles, and e-boards.",
  };
  if (path === "/store") return {
    title: "Battery Store | Jolt Revive Bronx, NYC",
    description: "Shop replacement e-bike, e-scooter, e-motorcycle, and e-board batteries from Jolt Revive in the Bronx.",
  };
  if (path === "/parts") return {
    title: "Battery Parts | Jolt Revive Bronx, NYC",
    description: "Find battery cells, BMS boards, chargers, connectors, and repair parts for electric rides in Bronx, NYC.",
  };
  if (path === "/repair") return {
    title: "Battery Repair & Diagnostics | Jolt Revive Bronx, NYC",
    description: "Get professional lithium-ion battery diagnostics, repairs, rebuilding, and connector service in the Bronx.",
  };
  if (path === "/repair/track") return {
    title: "Track Your Battery Repair | Jolt Revive Bronx, NYC",
    description: "Check the status of your Jolt Revive e-bike, e-scooter, e-motorcycle, or e-board battery repair.",
  };
  if (path === "/appointments") return {
    title: "Book Battery Service | Jolt Revive Bronx, NYC",
    description: "Schedule a battery diagnostic, repair, rebuild, or consultation with Jolt Revive in the Bronx.",
  };
  if (path === "/contact") return {
    title: "Contact Jolt Revive | Battery Repair in the Bronx, NYC",
    description: "Visit Jolt Revive at 1401 Blondell Ave in the Bronx or send our NYC battery repair team a message.",
  };
  if (path.startsWith("/product/")) return {
    title: "Replacement Battery Details | Jolt Revive Bronx, NYC",
    description: "View compatible replacement battery details for e-bikes, e-scooters, e-motorcycles, and e-boards in NYC.",
  };
  if (path === "/admin") return {
    title: "Jolt Revive Admin",
    description: "Private Jolt Revive submissions view.",
    noindex: true,
  };
  return {
    title: "Page Not Found | Jolt Revive",
    description: "Jolt Revive battery diagnostics, repair, rebuilding, and replacement in the Bronx, NYC.",
    noindex: true,
  };
}

function AppRouter() {
  const [loc] = useHashPath();
  // Strip query string for route matching; pages read params from the hash directly.
  const path = (loc.split("?")[0] || "/").replace(/#.*$/, "");
  useSeo(seoForPath(path));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  let page: React.ReactNode;
  if (path === "/") page = <HomePage />;
  else if (path === "/finder") page = <FinderPage />;
  else if (path === "/store") page = <StorePage />;
  else if (path === "/parts") page = <PartsPage />;
  else if (path.startsWith("/product/")) page = <ProductPage id={path.slice("/product/".length)} />;
  else if (path === "/cart") page = <CartPage />;
  else if (path === "/checkout") page = <CheckoutPage />;
  else if (path === "/repair") page = <RepairPage />;
  else if (path === "/repair/track") page = <TrackRepairPage />;
  else if (path === "/appointments") page = <AppointmentsPage />;
  else if (path === "/contact") page = <ContactPage />;
  else if (path === "/admin") page = <AdminPage />;
  else page = <NotFound />;

  return <>{page}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router hook={useHashPath}>
              <AppRouter />
            </Router>
            <ChatWidget />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
