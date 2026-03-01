import { createSlice, createSelector } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [],   // [{ _id, name, price, images, category }]
    },
    reducers: {
        toggleWishlist: (state, action) => {
            const product = action.payload;
            const idx = state.items.findIndex(i => i._id === product._id);
            if (idx !== -1) {
                state.items.splice(idx, 1);
            } else {
                state.items.push(product);
            }
        },
        clearWishlist: (state) => {
            state.items = [];
        },
    },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;

// Memoized selector for wishlist IDs to prevent unnecessary rerenders
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistIds = createSelector(
    [selectWishlistItems],
    (items) => items.map(i => i._id)
);
export const selectWishlistCount = (state) => state.wishlist.items.length;
export default wishlistSlice.reducer;
