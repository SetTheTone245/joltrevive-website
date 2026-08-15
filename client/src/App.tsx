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
import NotFound from "@/pages/not-found";

function AppRouter() {
  const [loc] = useHashPath();
  // Strip query string for route matching; pages read params from the hash directly.
  const path = (loc.split("?")[0] || "/").replace(/#.*$/, "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  let page: React.ReactNode;
  if (path === "/") page = <HomePage />;
  else if (path === "/finder") page = <FinderPage />;
  else if (path === "/store") page = <StorePage />;
  else if (path.startsWith("/product/")) page = <ProductPage id={path.slice("/product/".length)} />;
  else if (path === "/cart") page = <CartPage />;
  else if (path === "/checkout") page = <CheckoutPage />;
  else if (path === "/repair") page = <RepairPage />;
  else if (path === "/repair/track") page = <TrackRepairPage />;
  else if (path === "/appointments") page = <AppointmentsPage />;
  else if (path === "/contact") page = <ContactPage />;
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
