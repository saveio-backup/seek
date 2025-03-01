import Vue from 'vue'
import Vuex from 'vuex'
import modules from './modules/index'


Vue.use(Vuex)

export default new Vuex.Store({
    modules,
    plugins: [
        // createPersistedState(),
        // createSharedMutations()
    ],
    strict: process.env.NODE_ENV !== 'production'
})