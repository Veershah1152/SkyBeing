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
const BulkOrders = lazy(() => import("./pages/BulkOrders"));
const ChatWidget = lazy(() => import("./components/ui/ChatWidget"));

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
                          <Route path="/bulk-orders" element={<BulkOrders />} />
                        </Routes>
                      </Suspense>
                    </main>
                    <Footer />

                    {/* ── Floating WhatsApp CTA (sitewide) ──────────────────── */}
                    <a
                      id="floating-whatsapp-btn"
                      href="https://wa.me/918329245729?text=Hi%20SkyBeings!%20I%20want%20to%20know%20more%20about%20your%20products."
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Shop on WhatsApp"
                      style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: '#25D366',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '14px',
                        padding: '12px 20px',
                        borderRadius: '50px',
                        boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
                        textDecoration: 'none',
                        animation: 'wa-pulse 2.4s ease-in-out infinite',
                      }}
                    >
                      {/* WhatsApp SVG Icon */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="hidden sm:inline">Shop on WhatsApp</span>
                    </a>

                    {/* Pulse keyframes injected once */}
                    <style>{`
                      @keyframes wa-pulse {
                        0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,0.45); transform: scale(1); }
                        50% { box-shadow: 0 4px 32px rgba(37,211,102,0.75); transform: scale(1.04); }
                      }
                    `}</style>

                    {/* ── Skye AI Chat Widget (bottom-left) ─────────────── */}
                    <Suspense fallback={null}>
                      <ChatWidget />
                    </Suspense>
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
