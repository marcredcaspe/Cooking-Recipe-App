/**
 * Simple route helper function
 * In a production app, you'd use Ziggy (laravel/ziggy) for this
 * For now, this provides basic route functionality
 */

const routes = {
    'welcome': '/',
    'login': '/login',
    'register': '/register',
    'logout': '/logout',
    'dashboard': '/dashboard',
    'dashboard.random': '/dashboard/random-recipe',
    'favorites.store': '/favorites',
    'favorites.destroy': (mealId) => `/favorites/${mealId}`,
    'meal.details': (mealId) => `/meal/${mealId}`,
    'recipes.store': '/recipes',
    'recipes.update': (mealId) => `/recipes/${mealId}`,
    'recipes.delete': (mealId) => `/recipes/${mealId}`,
    'password.request': '/forgot-password',
    'password.email': '/forgot-password',
    'password.reset': (token) => `/reset-password/${token}`,
    'password.store': '/reset-password',
};

export default function route(name, ...params) {
    const routePath = routes[name];
    
    if (typeof routePath === 'function') {
        return routePath(...params);
    }
    
    return routePath || '#';
}

// Make it available globally for convenience
if (typeof window !== 'undefined') {
    window.route = route;
}

