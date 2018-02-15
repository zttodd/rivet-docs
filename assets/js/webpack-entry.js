/*
    swap vue.min out for vue if you need vue devtools
*/
const Vue = require('vue/dist/vue');
// const Vue = require('vue/dist/vue.min')
const plugins = require('./plugins')
const polyfills = require('./polyfills')
const axios = require('axios')
const moment = require('moment');

/**
 * Initialize polyfils here.
 */

// Plolyfills to add functionality to IE.
polyfills.forEachPolyfill();
polyfills.promisePolyfill();


/**
 * Register global Vue filters
 */
Vue.filter('formatDate', (value) => {
    if (value) {
        value = value.toString();
        return moment(value, 'YYYY-MM-DDThh:mm:ss.SSS+Z').fromNow();
    }
});

Vue.filter('capitalize', (value) => {
    if (!value) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
});

const comparePublishDates = (a, b) => {
    a = moment(a.publishedDate);
    b = b.publishedDate;
    return a.isSame(b) 
            ? 0
            : a.isBefore(b) ? 1 : -1;
}

/**
 * Main Vue.js Instance.
 */
new Vue({
    el: '#wrapper',
    components: {
        oneSearch: require('./components/one-search.vue'),
        searchForm: require('./components/search.vue'),
        notificationsMenu: require('./components/notifications-menu.vue'),
        notificationsCenter: require('./components/notifications-center.vue')
    },
    data: {
        // Controls the toggle of the section nav menu on mobile
        navIsVisible: false,
        isDrawerOpen: false,
        notifications: [],
        errors: [],
        loadingNotifications: false,
        errorLoadingNotifications: false
    },
    methods: {
        // Toggles the visibility of the section nav on mobile
        toggleNav: function() {
            this.navIsVisible = !this.navIsVisible;
        },

        // Listener for drawer toggle in header
        // Note: drawer show/hide is handled in Rivet js
        // this is an additional listener to set the height of the drawer when it is opened
        toggleDrawer() {
            this.isDrawerOpen = !this.isDrawerOpen

            this.$nextTick(()=>{
                if(this.isDrawerOpen) {
                    let drawer = document.querySelector('.rvt-drawer')
                    // set the drawer height to the height of the page minus 70px for the header
                    drawer.style.height = (document.body.scrollHeight-70)+"px"
                }
            })
        }
    },
    created() {
        const apiURL = 'http://dcd-notifications.apps-test.iu.edu/notifications/search/byTenants?names=Rivet';

        this.loadingNotifications = true;

        axios.get(apiURL)
            .then(response => {
                if(response.data._embedded && Array.isArray(response.data._embedded.notifications)) {
                    this.notifications = response.data._embedded.notifications.sort(comparePublishDates);
                } else {
                    this.errorLoadingNotifications = true;
                    console.log('Error loading notifications - API response must contain an array')
                }
            })
            .catch(e => {
                this.errors.push(e);
                console.log(this.errors);
                this.errorLoadingNotifications = true;
            })
            .then(() => {
                this.loadingNotifications = false;
            })
    },
})

/**
 * One-off scripts for random sutff. See 'plugins.js'
 */

 // Third-party libraries
plugins.clipboardInit();
plugins.tippyInit();

/**
 * Site-specific DOM scripting - Any DOM manipulation stuff
 * MUST come after the main Vue instance is initialized because
 * of Vue's virtal DOM implementation.
 */
plugins.createCopyright('#year');
plugins.setIndeterminate('#checkbox-indeterminate');

// Custom analytics event tracking
plugins.analyticsTracking();

console.log('Rivet 0.4.0 is ready!');

