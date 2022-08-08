import create from 'zustand';

const store = create(set => ({
    ready: false,
    address: null,
    reserves: []
}));

export default store;
