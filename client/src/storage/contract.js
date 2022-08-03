import create from 'zustand';

const store = create(set => ({
    ready: false,
    address: null,
    pools: []
}));

export default store;
