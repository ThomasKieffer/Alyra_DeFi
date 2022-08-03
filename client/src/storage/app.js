import create from 'zustand';

const store = create(set => ({
    error: null,
}));

export default store;
