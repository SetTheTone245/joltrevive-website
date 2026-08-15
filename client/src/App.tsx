import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
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
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/finder" component={FinderPage} />
      <Route path="/store" component={StorePage} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/repair" component={RepairPage} />
      <Route path="/repair/track" component={TrackRepairPage} />
      <Route path="/appointments" component={AppointmentsPage} />
      <Route path="/contact" component={ContactPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router hook={useHashLocation}>
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
