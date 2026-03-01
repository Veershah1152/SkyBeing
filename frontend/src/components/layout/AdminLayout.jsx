import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import {
    LayoutDashboard, Truck, Package, Globe, BarChart2,
    MessageSquare, Settings, LogOut, ChevronDown, ChevronRight,
    ShoppingCart, Users, Image, Tag, Layers, Sliders, Palette,
    Receipt, List, Plus, Star, BookOpen, GalleryHorizontal,
    CreditCard, Wrench, Home, AlignLeft, Menu, X
} from 'lucide-react';

const NavItem = ({ to, label, icon: Icon }) => {
    const { pathname } = useLocation();
    const active = pathname === to || (to !== '/admin' && pathname.startsWith(to));
    return (
        <Link to={to}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active
                ? 'bg-skyGreen text-white shadow-sm'
                : 'text-gray-600 hover:bg-skyGreen/10 hover:text-skyGreen'
                }`}>
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            <span>{label}</span>
        </Link>
    );
};

const NavGroup = ({ label, icon: Icon, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div>
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-skyBrown/70 uppercase tracking-widest hover:text-skyBrown transition-colors rounded-lg hover:bg-skyBrown/5">
                <span className="flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {label}
                </span>
                {open
                    ? <ChevronDown className="w-3.5 h-3.5" />
                    : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {open && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-skyGreen/20 pl-3">
                    {children}
                </div>
            )}
        </div>
    );
};

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    const Sidebar = () => (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-100 flex-shrink-0">
                <img src="/logo-cropped.png" alt="SkyBeing" className="h-10 w-auto object-contain scale-110" />
                <div>
                    <span className="text-lg font-bold text-gray-900 tracking-wide">SkyBeing</span>
                    <p className="text-[10px] text-skyGreen font-semibold uppercase tracking-widest leading-none">Admin Panel</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin">
                <NavItem to="/admin" label="Dashboard" icon={LayoutDashboard} />

                <div className="pt-2 pb-1" />
                <NavGroup label="Shipping" icon={Truck}>
                    <NavItem to="/admin/shipping/charges" label="Shipping Charges" icon={Receipt} />
                    <NavItem to="/admin/shipping/companies" label="Shipping Companies" icon={Truck} />
                </NavGroup>

                <NavGroup label="Order" icon={ShoppingCart}>
                    <NavItem to="/admin/orders" label="All Orders" icon={List} />
                </NavGroup>

                <NavGroup label="Product" icon={Package} defaultOpen>
                    <NavItem to="/admin/categories" label="Category" icon={Tag} />
                    <NavItem to="/admin/subcategories" label="Sub Category" icon={Layers} />
                    <NavItem to="/admin/attributes" label="Attributes" icon={Sliders} />
                    <NavItem to="/admin/attribute-values" label="Attribute Values" icon={AlignLeft} />
                    <NavItem to="/admin/colors" label="Colors" icon={Palette} />
                    <NavItem to="/admin/tax" label="Tax" icon={Receipt} />
                    <NavItem to="/admin/products" label="Product" icon={Package} />
                    <NavItem to="/admin/products/create" label="Create Product" icon={Plus} />
                </NavGroup>

                <NavGroup label="Website" icon={Globe} defaultOpen>
                    <NavItem to="/admin/stats" label="Stats" icon={BarChart2} />
                    <NavItem to="/admin/testimonials" label="Testimonials" icon={Star} />
                    <NavItem to="/admin/blogs" label="Blogs" icon={BookOpen} />
                    <NavItem to="/admin/banners" label="Banner" icon={Image} />
                    <NavItem to="/admin/gallery" label="Gallery" icon={GalleryHorizontal} />
                </NavGroup>

                <div className="pt-2 pb-1" />
                <NavItem to="/admin/reports" label="Reports" icon={BarChart2} />
                <NavItem to="/admin/inquiries" label="Inquiries" icon={MessageSquare} />
                <NavItem to="/admin/users" label="Users" icon={Users} />

                <div className="pt-2 pb-1" />
                <NavGroup label="Settings" icon={Settings}>
                    <NavItem to="/admin/settings/payment" label="Payment" icon={CreditCard} />
                    <NavItem to="/admin/settings/maintenance" label="Maintenance" icon={Wrench} />
                </NavGroup>
            </nav>

            {/* Bottom */}
            <div className="border-t border-gray-100 p-3 space-y-0.5 flex-shrink-0">
                <Link to="/"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all">
                    <Home className="w-4 h-4" /> Back to Shop
                </Link>
                <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
                    <LogOut className="w-4 h-4" /> Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-skyBg font-sans">
            {/* Desktop Sidebar */}
            <aside className="w-60 flex-shrink-0 hidden md:block">
                <Sidebar />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                    <div className="relative w-60 h-full z-10">
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className="text-base font-bold text-gray-800">Admin Panel</span>
                    </div>
                    <Link to="/"
                        className="text-sm font-semibold text-skyGreen border border-skyGreen/30 px-4 py-1.5 rounded-lg hover:bg-skyGreen hover:text-white transition-all">
                        View Site →
                    </Link>
                </header>

                {/* Page content */}
                <div className="flex-1 overflow-auto p-5 md:p-8 admin-page-enter">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
