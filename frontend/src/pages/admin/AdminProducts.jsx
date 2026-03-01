import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct, createProduct, updateProduct } from '../../store/slices/productSlice';
import { Plus, Trash2, Edit, Search, X, Loader2, Image as ImageIcon, Save, ArrowLeft, ChevronDown } from 'lucide-react';

const CATEGORIES = ['Feeder', 'Bird House', 'Water Feeder', 'Food', 'Accessories', 'Shelter', 'Toys'];
const TAX_OPTIONS = ['None', 'GST 5%', 'GST 12%', 'GST 18%', 'GST 28%'];

// Helper: get GST % from tax label
const getGSTRate = (taxLabel) => {
    if (!taxLabel || taxLabel === 'None') return 0;
    const match = taxLabel.match(/\d+/);
    return match ? Number(match[0]) : 0;
};

// Helper: calculate selling price from RP, discount, discountType, tax
const calcSellingPrice = (rp, discount, discountType, tax) => {
    const rpNum = parseFloat(rp) || 0;
    const discNum = parseFloat(discount) || 0;
    const gstRate = getGSTRate(tax);

    let discountedPrice = rpNum;
    if (discountType === 'percentage') {
        discountedPrice = rpNum - (rpNum * discNum / 100);
    } else {
        discountedPrice = rpNum - discNum;
    }

    const gstAmount = discountedPrice * gstRate / 100;
    const finalPrice = discountedPrice + gstAmount;
    return Math.max(0, Math.round(finalPrice * 100) / 100);
};
const PRESET_COLORS = [
    { name: 'Green', hex: '#22c55e' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Parrot Green', hex: '#16a34a' },
    { name: 'Red', hex: '#ef4444' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Brown', hex: '#92400e' },
];
const VARIANT_ATTRIBUTES = ['Color', 'Size', 'Material', 'Weight', 'Style'];

// ─── Reusable UI Atoms ─────────────────────────────────────────────────────
const Section = ({ title, children, className = '' }) => (
    <div className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 ${className}`}>
        <h3 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-100">{title}</h3>
        {children}
    </div>
);

const Label = ({ children, required, hint }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
        {children}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="text-gray-400 text-xs ml-1 font-normal">({hint})</span>}
    </label>
);

const Input = ({ className = '', ...props }) => (
    <input
        {...props}
        className={`w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none
            focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all
            placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
);

const SelectField = ({ children, className = '', ...props }) => (
    <select
        {...props}
        className={`w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm
            outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all appearance-none ${className}`}
    >
        {children}
    </select>
);

const Textarea = ({ className = '', ...props }) => (
    <textarea
        {...props}
        className={`w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm
            outline-none focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20
            transition-all placeholder-gray-400 resize-none ${className}`}
    />
);

// ─── Top Bar (shared) ──────────────────────────────────────────────────────
const FormTopBar = ({ productType, setProductType, isSubmitting, onSubmit, onCancel, isEditMode }) => (
    <div className="bg-white border-b border-gray-100 shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <button type="button" onClick={onCancel}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Products
            </button>
            <span className="text-gray-200">|</span>
            <h1 className="text-xl font-bold text-gray-900">
                {isEditMode ? '✏️ Edit Product' : `Create ${productType === 'simple' ? 'Simple' : 'Variant'} Product`}
            </h1>
            {isEditMode && <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">Edit Mode</span>}
        </div>

        <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {['variant', 'simple'].map(type => (
                    <button key={type} type="button" onClick={() => setProductType(type)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${productType === type
                            ? 'bg-white text-skyGreen shadow-sm ring-1 ring-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}>
                        {type === 'simple' ? 'Simple Product' : 'Variant Product'}
                    </button>
                ))}
            </div>
            <button type="button" onClick={onSubmit} disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen hover:bg-[#0c660b] text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
            </button>
        </div>
    </div>
);

// ─── Shared: General Info + Description ───────────────────────────────────
const GeneralInfoSection = ({ form, set }) => (
    <Section title="General Information">
        <div>
            <Label required>Product Name</Label>
            <Input placeholder="Enter product name" value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label required>Category</Label>
                <SelectField value={form.category} onChange={e => set('category', e.target.value)} required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </SelectField>
            </div>
            <div>
                <Label hint="optional">Sub Category</Label>
                <Input placeholder="Select sub category" value={form.subCategory} onChange={e => set('subCategory', e.target.value)} />
            </div>
        </div>
        <div>
            <Label hint="optional">Short Description</Label>
            <Textarea rows={4} placeholder="Enter short description" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} />
        </div>
    </Section>
);

const DescriptionSection = ({ form, set }) => (
    <Section title="Product Description">
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                <select className="bg-transparent text-gray-500 text-xs outline-none">
                    <option>Normal</option><option>H1</option><option>H2</option>
                </select>
                <span className="text-gray-300">|</span>
                {['B', 'I', 'U'].map(f => (
                    <button key={f} type="button"
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-skyGreen hover:bg-green-50 rounded font-bold text-xs transition-colors">
                        {f}
                    </button>
                ))}
                <span className="text-gray-300">|</span>
                <button type="button" className="text-gray-500 hover:text-skyGreen text-sm px-1">≡</button>
                <button type="button" className="text-gray-500 hover:text-skyGreen text-sm px-1">≡</button>
            </div>
            <textarea rows={5} placeholder="Enter detailed product description..."
                value={form.description} onChange={e => set('description', e.target.value)}
                className="w-full bg-white text-gray-900 px-4 py-3 text-sm outline-none resize-none placeholder-gray-400" />
        </div>
    </Section>
);

// ─── SIMPLE PRODUCT FORM ──────────────────────────────────────────────────
const SimpleProductForm = ({ form, set, images, previewUrls, handleImageChange, tagInput, setTagInput }) => {
    const addTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!form.tags.includes(tagInput.trim())) set('tags', [...form.tags, tagInput.trim()]);
            setTagInput('');
        }
    };
    const removeTag = (tag) => set('tags', form.tags.filter(t => t !== tag));

    // Live-calculated selling price from RP, discount, tax
    const sellingPrice = calcSellingPrice(form.mrp, form.discount, form.discountType, form.tax);
    const gstRate = getGSTRate(form.tax);
    const rpNum = parseFloat(form.mrp) || 0;
    const discNum = parseFloat(form.discount) || 0;
    const discountedPrice = form.discountType === 'percentage'
        ? rpNum - (rpNum * discNum / 100)
        : rpNum - discNum;
    const gstAmount = discountedPrice * gstRate / 100;

    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* LEFT */}
            <div className="space-y-6">
                <GeneralInfoSection form={form} set={set} />

                <Section title="Pricing & Discounts">
                    {/* Row 1: RP + Manufacturing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label required hint="Retail Price before discount">RP (Retail Price)</Label>
                            <Input
                                type="number"
                                placeholder="Enter Retail Price"
                                value={form.mrp}
                                onChange={e => { set('mrp', e.target.value); set('price', calcSellingPrice(e.target.value, form.discount, form.discountType, form.tax)); }}
                                required
                            />
                        </div>
                        <div>
                            <Label hint="optional">Manufacturing Price</Label>
                            <Input type="number" placeholder="Enter Manufacturing Price" value={form.manufacturingPrice} onChange={e => set('manufacturingPrice', e.target.value)} />
                        </div>
                    </div>

                    {/* Row 2: Discount + Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Discount</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={form.discount}
                                onChange={e => { set('discount', e.target.value); set('price', calcSellingPrice(form.mrp, e.target.value, form.discountType, form.tax)); }}
                            />
                        </div>
                        <div>
                            <Label>Discount Type</Label>
                            <SelectField
                                value={form.discountType}
                                onChange={e => { set('discountType', e.target.value); set('price', calcSellingPrice(form.mrp, form.discount, e.target.value, form.tax)); }}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat (Rs.)</option>
                            </SelectField>
                        </div>
                    </div>

                    {/* Row 3: GST (Tax) */}
                    <div>
                        <Label hint="Added to discounted price — not shown to customer">GST / Tax</Label>
                        <SelectField
                            value={form.tax}
                            onChange={e => { set('tax', e.target.value); set('price', calcSellingPrice(form.mrp, form.discount, form.discountType, e.target.value)); }}
                        >
                            <option value="">-- Select GST --</option>
                            {TAX_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </SelectField>
                    </div>

                    {/* ── Live Price Breakdown ── */}
                    {form.mrp > 0 && (
                        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
                            <h4 className="font-semibold text-gray-700 mb-2">💰 Price Breakdown (Admin View)</h4>
                            <div className="flex justify-between text-gray-600">
                                <span>Retail Price (RP)</span>
                                <span>₹ {rpNum.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-red-500">
                                <span>Discount ({form.discountType === 'percentage' ? `${discNum}%` : `₹${discNum} flat`})</span>
                                <span>− ₹ {(rpNum - discountedPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {gstRate > 0 && (
                                <div className="flex justify-between text-blue-600">
                                    <span>GST ({gstRate}%) — included in price</span>
                                    <span>+ ₹ {gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-skyGreen text-base border-t border-gray-200 pt-2 mt-2">
                                <span>Customer Selling Price</span>
                                <span>₹ {sellingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">GST is included in the selling price and not shown separately to customers.</p>
                        </div>
                    )}
                </Section>

                <Section title="Product Attributes">
                    <Label>Select Attributes</Label>
                    <Input placeholder="Select Attribute" disabled />
                    <p className="text-xs text-gray-400 mt-1">Attributes like Color, Size will be available here.</p>
                </Section>

                <DescriptionSection form={form} set={set} />
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
                <Section title="Shipping Details">
                    <div>
                        <Label>Shipping Weight <span className="text-gray-400 text-xs font-normal">(Enter in Gram)</span></Label>
                        <Input placeholder="Enter weight (e.g., 1000g, 500g)" value={form.shippingWeight} onChange={e => set('shippingWeight', e.target.value)} />
                    </div>
                    <div>
                        <Label hint="Optional">Shipping Dimensions</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {[['Length', 'shippingLength', '10cm'], ['Width', 'shippingWidth', '5cm'], ['Height', 'shippingHeight', '8cm']].map(([label, field, eg]) => (
                                <div key={field}>
                                    <Input placeholder={`Enter ${label}`} value={form[field]} onChange={e => set(field, e.target.value)} />
                                    <p className="text-xs text-gray-400 mt-1">(e.g. {eg})</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section title="General Details">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label hint="optional">SKU</Label>
                            <Input placeholder="Enter SKU" value={form.sku} onChange={e => set('sku', e.target.value)} />
                        </div>
                        <div>
                            <Label hint="optional">Product Barcode</Label>
                            <Input placeholder="Enter Product Barcode" value={form.barcode} onChange={e => set('barcode', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <Label>Product Tags</Label>
                        <p className="text-xs text-gray-400 mb-2">(e.g., bird feeder, bird feeder green)</p>
                        {form.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 bg-green-50 text-skyGreen border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <Input placeholder="Add Tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />
                        <p className="text-xs text-gray-400 mt-1">Type and press Enter to add tags</p>
                    </div>
                </Section>

                <Section title="Inventory Management">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Stock Status</Label>
                            <SelectField value={form.stockStatus} onChange={e => set('stockStatus', e.target.value)}>
                                <option value="in_stock">In Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                                <option value="backorder">Back Order</option>
                            </SelectField>
                        </div>
                        <div>
                            <Label required>Current Stock</Label>
                            <Input type="number" placeholder="Enter Current Stock" value={form.stock} onChange={e => set('stock', e.target.value)} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Min Stock</Label>
                            <Input type="number" value={form.minStock} onChange={e => set('minStock', e.target.value)} />
                        </div>
                        <div>
                            <Label>Track Product Min Stock</Label>
                            <SelectField value={form.trackStock} onChange={e => set('trackStock', e.target.value)}>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </SelectField>
                        </div>
                    </div>
                </Section>

                <Section title="Media">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-skyGreen hover:bg-green-50/40 transition-all group">
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                        {previewUrls.length === 0 ? (
                            <>
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 group-hover:bg-green-100 flex items-center justify-center mb-3 transition-colors">
                                    <ImageIcon className="w-7 h-7 text-gray-400 group-hover:text-skyGreen transition-colors" />
                                </div>
                                <span className="text-sm font-semibold text-gray-600 group-hover:text-skyGreen transition-colors">Upload Images</span>
                                <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB each</span>
                            </>
                        ) : (
                            <div className="flex flex-wrap gap-3 justify-center">
                                {previewUrls.map((url, i) => <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm" />)}
                                <div className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-xs hover:border-skyGreen hover:text-skyGreen transition-colors">
                                    <Plus className="w-5 h-5 mb-1" />Add more
                                </div>
                            </div>
                        )}
                    </label>
                </Section>
            </div>
        </div>
    );
};

// ─── VARIANT PRODUCT FORM ─────────────────────────────────────────────────
const VariantProductForm = ({ form, set, images, previewUrls, handleImageChange }) => {
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedAttribute, setSelectedAttribute] = useState('');
    const [variantList, setVariantList] = useState([]); // [{ attribute, value/color, stock, price }]
    const [newVariant, setNewVariant] = useState({ attribute: 'Color', value: '', color: '', stock: '', price: '' });

    const toggleColor = (color) => {
        setSelectedColors(prev =>
            prev.find(c => c.hex === color.hex)
                ? prev.filter(c => c.hex !== color.hex)
                : [...prev, color]
        );
    };

    const addVariant = () => {
        if (selectedColors.length === 0 && !newVariant.value) return;

        // If using color picker, add each selected color as a variant row
        if (selectedAttribute === 'Color' || !selectedAttribute) {
            const colorVariants = selectedColors.map(color => ({
                attribute: 'Color',
                value: color.name,
                color: color.hex,
                stock: Number(newVariant.stock) || 0,
                price: Number(newVariant.price) || Number(form.price) || 0
            }));
            setVariantList(prev => [...prev, ...colorVariants]);
            setSelectedColors([]);
        } else {
            setVariantList(prev => [...prev, {
                attribute: selectedAttribute,
                value: newVariant.value,
                color: '',
                stock: Number(newVariant.stock) || 0,
                price: Number(newVariant.price) || Number(form.price) || 0
            }]);
        }
        setNewVariant({ attribute: selectedAttribute, value: '', color: '', stock: '', price: '' });
        // Sync to form
        set('variants', [...variantList]);
    };

    const removeVariant = (idx) => {
        const updated = variantList.filter((_, i) => i !== idx);
        setVariantList(updated);
        set('variants', updated);
    };

    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* LEFT */}
            <div className="space-y-6">
                <GeneralInfoSection form={form} set={set} />
                <DescriptionSection form={form} set={set} />
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
                {/* Create Variant section */}
                <Section title="Create Variant">
                    {/* Attribute selector */}
                    <div>
                        <Label>Variant Attribute</Label>
                        <div className="flex gap-2">
                            <SelectField
                                value={selectedAttribute}
                                onChange={e => setSelectedAttribute(e.target.value)}
                                className="flex-1"
                            >
                                <option value="">Select variant attribute</option>
                                {VARIANT_ATTRIBUTES.map(a => <option key={a} value={a}>{a}</option>)}
                            </SelectField>
                            <button type="button"
                                onClick={() => setSelectedAttribute('')}
                                className="w-10 h-10 flex items-center justify-center border-2 border-skyGreen text-skyGreen rounded-xl hover:bg-skyGreen hover:text-white transition-all font-bold text-lg">
                                +
                            </button>
                        </div>
                    </div>

                    {/* Color Swatches — shown when attribute is Color */}
                    {(!selectedAttribute || selectedAttribute === 'Color') && (
                        <div>
                            <Label>Select Colors</Label>
                            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                {PRESET_COLORS.map(color => (
                                    <button key={color.hex} type="button"
                                        onClick={() => toggleColor(color)}
                                        title={color.name}
                                        className={`group flex flex-col items-center gap-1 transition-transform hover:scale-110`}
                                    >
                                        <div
                                            className={`w-9 h-9 rounded-xl shadow-sm border-2 transition-all ${selectedColors.find(c => c.hex === color.hex)
                                                ? 'border-gray-900 scale-110 ring-2 ring-offset-1 ring-skyGreen'
                                                : 'border-gray-200'
                                                }`}
                                            style={{ backgroundColor: color.hex }}
                                        />
                                        <span className="text-xs text-gray-500 leading-none">{color.name}</span>
                                    </button>
                                ))}
                            </div>
                            {selectedColors.length > 0 && (
                                <p className="text-xs text-skyGreen mt-2 font-medium">
                                    {selectedColors.length} color{selectedColors.length > 1 ? 's' : ''} selected: {selectedColors.map(c => c.name).join(', ')}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Non-color attribute value */}
                    {selectedAttribute && selectedAttribute !== 'Color' && (
                        <div>
                            <Label>Value</Label>
                            <Input placeholder={`Enter ${selectedAttribute} value (e.g., XL, 500g)`}
                                value={newVariant.value} onChange={e => setNewVariant(v => ({ ...v, value: e.target.value }))} />
                        </div>
                    )}

                    {/* Stock & Price per variant */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Stock for this variant</Label>
                            <Input type="number" placeholder="e.g. 50"
                                value={newVariant.stock} onChange={e => setNewVariant(v => ({ ...v, stock: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Price for this variant</Label>
                            <Input type="number" placeholder="e.g. 499"
                                value={newVariant.price} onChange={e => setNewVariant(v => ({ ...v, price: e.target.value }))} />
                        </div>
                    </div>

                    <button type="button" onClick={addVariant}
                        className="w-full py-2.5 bg-skyGreen hover:bg-[#0c660b] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                        <Plus className="w-4 h-4" />
                        Add Variant
                    </button>

                    {/* Variant List */}
                    {variantList.length > 0 && (
                        <div className="mt-2 space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700">Added Variants</h4>
                            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                                {variantList.map((v, i) => (
                                    <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {v.color && (
                                                <div className="w-5 h-5 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                                                    style={{ backgroundColor: v.color }} />
                                            )}
                                            <div>
                                                <span className="text-sm font-medium text-gray-800">{v.attribute}: {v.value}</span>
                                                <span className="ml-3 text-xs text-gray-500">Stock: {v.stock} &bull; ${v.price}</span>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => removeVariant(i)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Section>

                {/* General Details for variant */}
                <Section title="General Details">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label hint="optional">SKU</Label>
                            <Input placeholder="Enter SKU" value={form.sku} onChange={e => set('sku', e.target.value)} />
                        </div>
                        <div>
                            <Label hint="optional">Product Barcode</Label>
                            <Input placeholder="Enter Product Barcode" value={form.barcode} onChange={e => set('barcode', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <Label required>Base Price (MRP)</Label>
                        <Input type="number" placeholder="Enter base MRP" value={form.price} onChange={e => set('price', e.target.value)} required />
                    </div>
                    <div>
                        <Label required>Base Stock</Label>
                        <Input type="number" placeholder="Enter total stock" value={form.stock} onChange={e => set('stock', e.target.value)} required />
                    </div>
                </Section>

                {/* Media Upload */}
                <Section title="Media">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-skyGreen hover:bg-green-50/40 transition-all group">
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                        {previewUrls.length === 0 ? (
                            <>
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 group-hover:bg-green-100 flex items-center justify-center mb-3 transition-colors">
                                    <ImageIcon className="w-7 h-7 text-gray-400 group-hover:text-skyGreen transition-colors" />
                                </div>
                                <span className="text-sm font-semibold text-gray-600 group-hover:text-skyGreen transition-colors">Upload Images</span>
                                <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB each</span>
                            </>
                        ) : (
                            <div className="flex flex-wrap gap-3 justify-center">
                                {previewUrls.map((url, i) => <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm" />)}
                            </div>
                        )}
                    </label>
                </Section>
            </div>
        </div>
    );
};

// ─── Create/Edit Product Controller ──────────────────────────────────────
const CreateProductForm = ({ onCancel, onSuccess, editingProduct }) => {
    const dispatch = useDispatch();
    const isEditMode = !!editingProduct;
    const [productType, setProductType] = useState(editingProduct?.productType || 'simple');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState(editingProduct?.images || []);

    const [form, setForm] = useState({
        name: editingProduct?.name || '',
        category: editingProduct?.category || '',
        subCategory: editingProduct?.subCategory || '',
        shortDescription: editingProduct?.shortDescription || '',
        description: editingProduct?.description || '',
        price: editingProduct?.price ?? '',
        mrp: editingProduct?.mrp ?? editingProduct?.price ?? '',
        manufacturingPrice: editingProduct?.manufacturingPrice ?? '',
        discount: editingProduct?.discount ?? '0',
        discountType: editingProduct?.discountType || 'percentage',
        discountStartDate: editingProduct?.discountStartDate?.slice(0, 10) || '',
        discountEndDate: editingProduct?.discountEndDate?.slice(0, 10) || '',
        tax: editingProduct?.tax || '',
        sku: editingProduct?.sku || '',
        barcode: editingProduct?.barcode || '',
        tags: editingProduct?.tags || [],
        stock: editingProduct?.stock ?? '',
        stockStatus: editingProduct?.stockStatus || 'in_stock',
        minStock: editingProduct?.minStock ?? '2',
        trackStock: String(editingProduct?.trackStock ?? 'true'),
        shippingWeight: editingProduct?.shippingWeight || '',
        shippingLength: editingProduct?.shippingLength || '',
        shippingWidth: editingProduct?.shippingWidth || '',
        shippingHeight: editingProduct?.shippingHeight || '',
        variants: editingProduct?.variants || []
    });

    const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        setPreviewUrls(files.map(f => URL.createObjectURL(f)));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (k === 'tags' || k === 'variants') data.append(k, JSON.stringify(v));
                else data.append(k, v);
            });
            data.append('productType', productType);
            images.forEach(img => data.append('images', img));

            let result;
            if (isEditMode) {
                result = await dispatch(updateProduct({ id: editingProduct._id, formData: data }));
                if (updateProduct.fulfilled.match(result)) onSuccess();
                else alert(result.payload || 'Failed to update product');
            } else {
                result = await dispatch(createProduct(data));
                if (createProduct.fulfilled.match(result)) onSuccess();
                else alert(result.payload || 'Failed to create product');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const sharedProps = { form, set, images, previewUrls, handleImageChange };

    return (
        <div className="min-h-full bg-gray-50">
            <FormTopBar
                productType={productType}
                setProductType={setProductType}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onCancel={onCancel}
                isEditMode={isEditMode}
            />
            <form onSubmit={handleSubmit}>
                {productType === 'simple'
                    ? <SimpleProductForm {...sharedProps} tagInput={tagInput} setTagInput={setTagInput} />
                    : <VariantProductForm {...sharedProps} />
                }
            </form>
        </div>
    );
};

// ─── Products List ────────────────────────────────────────────────────────
const AdminProducts = () => {
    const dispatch = useDispatch();
    const { items: products, status } = useSelector((state) => state.products);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

    const handleEdit = (product) => { setEditingProduct(product); setShowCreateForm(true); };
    const handleCloseForm = () => { setShowCreateForm(false); setEditingProduct(null); };
    const handleSuccess = () => { setShowCreateForm(false); setEditingProduct(null); dispatch(fetchProducts()); };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await dispatch(deleteProduct(id));
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showCreateForm) {
        return <CreateProductForm
            onCancel={handleCloseForm}
            onSuccess={handleSuccess}
            editingProduct={editingProduct}
        />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Products <span className="text-gray-400 text-lg font-normal ml-2">({products.length})</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your store's inventory and product details.</p>
                </div>
                <button onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] shadow-sm transition-all hover:shadow-md transform hover:-translate-y-0.5">
                    <Plus className="w-5 h-5" /> Add Product
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Search products by name or category..."
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all outline-none" />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Product', 'Category', 'Price', 'Stock', 'Actions'].map((h, i) => (
                                    <th key={h} className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {status === 'loading' && products.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-skyGreen" />
                                </td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">No products found.</td></tr>
                            ) : filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-green-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                {product.images?.[0]
                                                    ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-5 h-5" /></div>}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 group-hover:text-skyGreen transition-colors">{product.name}</div>
                                                <div className="text-sm text-gray-400 truncate max-w-xs">{product.shortDescription || product.description}</div>
                                                {product.variants?.length > 0 && (
                                                    <div className="flex gap-1 mt-1">
                                                        {product.variants.slice(0, 5).map((v, i) => v.color
                                                            ? <div key={i} className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: v.color }} title={v.value} />
                                                            : <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100">{v.value}</span>
                                                        )}
                                                        {product.variants.length > 5 && <span className="text-xs text-gray-400">+{product.variants.length - 5}</span>}
                                                    </div>
                                                )}
                                                {product.tags?.length > 0 && (
                                                    <div className="flex gap-1 mt-1 flex-wrap">
                                                        {product.tags.slice(0, 3).map(t => (
                                                            <span key={t} className="text-[10px] bg-green-50 text-skyGreen border border-green-100 px-1.5 py-0.5 rounded-full">{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{product.category}</span>
                                        {product.subCategory && <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">{product.subCategory}</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">${product.price?.toFixed(2)}</div>
                                        {product.discount > 0 && <div className="text-xs text-green-600 font-medium">{product.discount}{product.discountType === 'percentage' ? '%' : ' flat'} off</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800'
                                            : product.stock > 0 ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'}`}>
                                            {product.stock}{product.stock === 0 ? ' — Out of stock' : ''}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(product)}
                                                className="p-2 text-gray-400 hover:text-skyGreen hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(product._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminProducts;
