import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef, lazy, Suspense, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "./store/slices/cartSlice";
import { fetchCurrentUser } from "./store/slices/authSlice";
import api from "./api/axios";
import { ToastProvider } from "./components/ui/Toast";
import SkeletonLoader from "./components/ui/SkeletonLoader";

// ── Visit tracker ────────────────────────────────────────────────────────────
const getSessionId = () => {
  let sid = sessionStorage.getItem("_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("_sid", sid);
  }
  return sid;
};

function VisitTracker() {
  const location = useLocation();
  const lastPath = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (location.pathname === lastPath.current) return;
    lastPath.current = location.pathname;

    // Fire pixels (they are deferred post-load anyway via index.html)
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
    if (typeof window !== "undefined" && window.gtag) {
      // Track Google Analytics page view
      window.gtag("config", "G-Y6SJEH301S", { page_path: location.pathname + location.search });

      const adsId = import.meta.env.VITE_GOOGLE_ADS_ID;
      if (adsId && adsId !== "YOUR_GOOGLE_ADS_ID_HERE") {
        window.gtag("config", adsId, { page_path: location.pathname + location.search });
      }
    }

    // ── stats/visit: push to idle queue so it NEVER blocks the critical path ──
    // Uses requestIdleCallback if available, falls back to a 2-second setTimeout
    const sendVisit = () => {
      api
        .post("/stats/visit", { page: location.pathname, sessionId: getSessionId() })
        .catch(() => { });
    };

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(sendVisit, { timeout: 3000 });
    } else {
      setTimeout(sendVisit, 2000);
    }
  }, [location.pathname, location.search]);
  return null;
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Layout (always needed — keep eager) ─────────────────────────────────────
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AdminRoute from "./components/auth/AdminRoute";
import AdminLayout from "./components/layout/AdminLayout";

// ── Public Pages (lazy-loaded per route) ─────────────────────────────────────
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Auth = lazy(() => import("./pages/Auth"));
const Contact = lazy(() => import("./pages/Contact"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogDetails = lazy(() => import("./pages/BlogDetails"));
const MaintenancePage = lazy(() => import("./pages/MaintenancePage"));

// ── Admin Pages (lazy-loaded per route) ─────────────────────────────────────
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));
const AdminShippingCharges = lazy(() => import("./pages/admin/AdminShippingCharges"));
const AdminShippingCompanies = lazy(() => import("./pages/admin/AdminShippingCompanies"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminSubCategories = lazy(() => import("./pages/admin/AdminSubCategories"));
const AdminAttributesPage = lazy(() => import("./pages/admin/AdminAttributes"));
const AdminAttributeValues = lazy(() => import("./pages/admin/AdminAttributeValues"));
const AdminColors = lazy(() => import("./pages/admin/AdminColors"));
const AdminTax = lazy(() => import("./pages/admin/AdminTax"));
const AdminStats = lazy(() => import("./pages/admin/AdminStats"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminInquiries = lazy(() => import("./pages/admin/AdminInquiries"));
const AdminSettingsPayment = lazy(() => import("./pages/admin/AdminSettingsPayment"));
const AdminSettingsMaintenance = lazy(() => import("./pages/admin/AdminSettingsMaintenance"));

// ── Shared fallback ───────────────────────────────────────────────────────────
const PageFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center bg-white">
    <SkeletonLoader text="Loading..." />
  </div>
);

// ── Maintenance Guard ─────────────────────────────────────────────────────────
// Only activates AFTER maintenance check resolves. Default is "not in maintenance"
// so the page renders immediately on first load.
const MaintenanceGuard = ({ maintenanceMode, user, maintenanceMessage, children }) => {
  const location = useLocation();
  if (maintenanceMode && user?.role !== "admin" && location.pathname !== "/login") {
    return (
      <Suspense fallback={<PageFallback />}>
        <MaintenancePage message={maintenanceMessage} />
      </Suspense>
    );
  }
  return children;
};

// ── Root App ──────────────────────────────────────────────────────────────────
function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  useEffect(() => {
    // ── Fire auth + maintenance check in PARALLEL, never block render ──
    // Both are initiated immediately but neither gates the page render.
    dispatch(fetchCurrentUser());

    api
      .get("/settings/maintenance")
      .then((res) => {
        if (res.data?.data?.isMaintenanceMode) {
          setMaintenanceMode(true);
          setMaintenanceMessage(res.data.data.maintenanceMessage);
        }
      })
      .catch(() => {
        // Default: not in maintenance — safe to ignore
      });
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // ── NO BLOCKING GATE ─────────────────────────────────────────────────────
  // Previously: `if (authStatus === "loading" || isCheckingMaintenance) return <Skeleton />`
  // That blocked ALL rendering for ~1000ms+ waiting for two Render API calls.
  // Now: render the page immediately. Auth state updates reactively when /users/me responds.
  // MaintenanceGuard defaults to "open" and switches only if maintenance is actually ON.

  return (
    <ToastProvider>
      <Router>
        <VisitTracker />
        <div className="flex flex-col min-h-screen font-sans selection:bg-skyGreen/20 selection:text-skyGreen">
          <Routes>
            {/* ── Admin Routes ──────────────────────────────────────────────── */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Suspense fallback={<PageFallback />}><AdminDashboard /></Suspense>} />
                <Route path="products" element={<Suspense fallback={<PageFallback />}><AdminProducts /></Suspense>} />
                <Route path="products/create" element={<Suspense fallback={<PageFallback />}><AdminProducts /></Suspense>} />
                <Route path="categories" element={<Suspense fallback={<PageFallback />}><AdminCategories /></Suspense>} />
                <Route path="subcategories" element={<Suspense fallback={<PageFallback />}><AdminSubCategories /></Suspense>} />
                <Route path="attributes" element={<Suspense fallback={<PageFallback />}><AdminAttributesPage /></Suspense>} />
                <Route path="attribute-values" element={<Suspense fallback={<PageFallback />}><AdminAttributeValues /></Suspense>} />
                <Route path="colors" element={<Suspense fallback={<PageFallback />}><AdminColors /></Suspense>} />
                <Route path="tax" element={<Suspense fallback={<PageFallback />}><AdminTax /></Suspense>} />
                <Route path="orders" element={<Suspense fallback={<PageFallback />}><AdminOrders /></Suspense>} />
                <Route path="users" element={<Suspense fallback={<PageFallback />}><AdminUsers /></Suspense>} />
                <Route path="shipping/charges" element={<Suspense fallback={<PageFallback />}><AdminShippingCharges /></Suspense>} />
                <Route path="shipping/companies" element={<Suspense fallback={<PageFallback />}><AdminShippingCompanies /></Suspense>} />
                <Route path="stats" element={<Suspense fallback={<PageFallback />}><AdminStats /></Suspense>} />
                <Route path="testimonials" element={<Suspense fallback={<PageFallback />}><AdminTestimonials /></Suspense>} />
                <Route path="blogs" element={<Suspense fallback={<PageFallback />}><AdminBlogs /></Suspense>} />
                <Route path="banners" element={<Suspense fallback={<PageFallback />}><AdminBanners /></Suspense>} />
                <Route path="gallery" element={<Suspense fallback={<PageFallback />}><AdminGallery /></Suspense>} />
                <Route path="reports" element={<Suspense fallback={<PageFallback />}><AdminReports /></Suspense>} />
                <Route path="inquiries" element={<Suspense fallback={<PageFallback />}><AdminInquiries /></Suspense>} />
                <Route path="settings/payment" element={<Suspense fallback={<PageFallback />}><AdminSettingsPayment /></Suspense>} />
                <Route path="settings/maintenance" element={<Suspense fallback={<PageFallback />}><AdminSettingsMaintenance /></Suspense>} />
              </Route>
            </Route>

            {/* ── Public / Customer Routes ──────────────────────────────────── */}
            <Route
              path="*"
              element={
                <MaintenanceGuard
                  maintenanceMode={maintenanceMode}
                  maintenanceMessage={maintenanceMessage}
                  user={user}
                >
                  <>
                    <Header />
                    <main className="flex-grow">
                      <Suspense fallback={<PageFallback />}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/shop" element={<Shop />} />
                          {/* ── SEO-friendly collection URLs (Step 2 of SEO roadmap) ── */}
                          <Route path="/collections/:categorySlug" element={<Shop />} />
                          <Route path="/product/:id" element={<ProductDetails />} />
                          <Route path="/gallery" element={<Gallery />} />
                          <Route path="/blogs" element={<Blogs />} />
                          <Route path="/blogs/:slug" element={<BlogDetails />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/login" element={<Auth />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/wishlist" element={<Wishlist />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/return-policy" element={<ReturnPolicy />} />
                          <Route path="/shipping-policy" element={<ShippingPolicy />} />
                          <Route path="/terms" element={<TermsConditions />} />
                          <Route path="/about" element={<AboutUs />} />
                        </Routes>
                      </Suspense>
                    </main>
                    <Footer />
                  </>
                </MaintenanceGuard>
              }
            />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
