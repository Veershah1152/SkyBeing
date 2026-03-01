import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const saveCartToLocal = (state) => {
    localStorage.setItem('localCart', JSON.stringify({
        items: state.items,
        totalQuantity: state.totalQuantity,
        totalAmount: state.totalAmount,
    }));
};

const loadCartFromLocal = () => {
    try {
        const stored = localStorage.getItem('localCart');
        if (stored) return JSON.parse(stored);
    } catch (e) { }
    return { items: [], totalQuantity: 0, totalAmount: 0 };
};

// Intercept all cart operations entirely locally (Guest checkout support)
export const fetchCart = createAsyncThunk('cart/fetchCart', async () => loadCartFromLocal());

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, quantity }, { getState }) => {
        let product = getState().products?.items?.find(p => p._id === productId);
        if (!product) {
            // Fetch if not currently in global state
            const res = await api.get(`/products/${productId}`);
            product = res.data.data;
        }
        return { product, quantity };
    }
);

export const updateCartQuantity = createAsyncThunk(
    'cart/updateCartQuantity',
    async ({ productId, quantity }) => ({ productId, quantity })
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (productId) => productId
);

const initialState = {
    ...loadCartFromLocal(),
    status: 'idle',
    error: null,
};

const recalculateTotals = (state) => {
    state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
    state.totalAmount = state.items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
    saveCartToLocal(state);
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCartLocal: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
            saveCartToLocal(state);
        }
    },
    extraReducers: (builder) => {
        // Fetch
        builder.addCase(fetchCart.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.items || [];
                recalculateTotals(state);
            })
            .addCase(fetchCart.rejected, (state) => {
                state.status = 'idle';
            });

        // Add
        builder.addCase(addToCart.fulfilled, (state, action) => {
            const { product, quantity } = action.payload;
            const existing = state.items.find(i => i.product._id === product._id);
            if (existing) {
                existing.quantity += quantity;
            } else {
                state.items.push({ product, quantity });
            }
            recalculateTotals(state);
        });

        // Update
        builder.addCase(updateCartQuantity.fulfilled, (state, action) => {
            const { productId, quantity } = action.payload;
            const existing = state.items.find(i => i.product._id === productId);
            if (existing) {
                existing.quantity = quantity;
            }
            recalculateTotals(state);
        });

        // Remove
        builder.addCase(removeFromCart.fulfilled, (state, action) => {
            const productId = action.payload;
            state.items = state.items.filter(i => i.product._id !== productId);
            recalculateTotals(state);
        });
    }
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
