let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  registerServiceWorker();
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };

  const theMap = document.getElementById('map')

  self.map = new google.maps.Map(theMap, {
    zoom: 12,
    center: loc,
    scrollwheel: false,
    format: 'jpg'
  });

  map.addListener('tilesloaded', function () {
    theMap.querySelectorAll('img').forEach(value => value.alt = "Google Maps Image Tile");
  });

  updateRestaurants();
    
  let setTitle = () => {
    const iFrameGoogleMaps = document.querySelector('#map iframe');
    iFrameGoogleMaps.setAttribute('title', 'Google Maps overview of restaurants');
  }
  self.map.addListener('tilesloaded', setTitle);
}


// Install service worker
registerServiceWorker = () => {
  if (navigator.serviceWorker) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(registration => console.log('SW installed: ', registration.scope))
        .catch(err => console.log('SW error: ', err));
    })
  }
}

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}
/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  new LazyLoad();

  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.className = 'restaurantCard';

  const image = document.createElement('img');
  image.className = 'img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('alt', restaurant.name + ' Restaurant Image');
  li.append(image);

  const divCardPrimary = document.createElement('div');
  divCardPrimary.className = 'cardTown';
  const name = document.createElement('h2');
  name.className = 'cardTitle';
  name.innerHTML = restaurant.name;
  li.append(name);

  const favoriteIcon = document.createElement('span');
  favoriteIcon.className = 'restaurant-fav';

  const favoriteIconImg = document.createElement('img');
  if (restaurant.is_favorite === "true") {
    favoriteIconImg.alt = 'Favorited ' + restaurant.name;
    favoriteIconImg.setAttribute("data-src", './img/ico-fav.png');
    favoriteIconImg.className = 'restaurant-fav-icon fav';
    favoriteIconImg.setAttribute("alt", 'The restaurant is marked as favourite');
    favoriteIconImg.setAttribute("aria-labelledby", 'The restaurant is marked as favourite');
    favoriteIconImg.setAttribute("title", 'The restaurant is marked as favourite');
    favoriteIconImg.setAttribute("aria-label", `Click to remove ${restaurant.name} from favourite`);
  } else {
    favoriteIconImg.setAttribute("data-src", './img/ico-fav-o.png');
    favoriteIconImg.className = 'restaurant-fav-icon fav-not';
    favoriteIconImg.setAttribute("alt", 'The restaurant is not marked as favourite');
    favoriteIconImg.setAttribute("aria-labelledby", 'The restaurant is not marked as favourite');
    favoriteIconImg.setAttribute("title", 'The restaurant is not marked as favourite');
    favoriteIconImg.setAttribute("aria-label", `Click to mark ${restaurant.name} as favourite`);
  }

  favoriteIconImg.addEventListener('click', () => {
    const src = favoriteIconImg.src;
    if (src.includes('img/ico-fav-o.png')) {
      DBHelper.addRestaurantToFavorites(restaurant.id, true, (err, res) => {
        favoriteIconImg.src = './img/ico-fav.png';
      });
    } else {
      DBHelper.addRestaurantToFavorites(restaurant.id, false, (err, res) => {
        favoriteIconImg.src = './img/ico-fav-o.png';
      });
    }
  })

  favoriteIcon.append(favoriteIconImg);
  name.prepend(favoriteIcon);


  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
 divCardPrimary.append(neighborhood);
  li.append(divCardPrimary);

  const divCardSecondary = document.createElement('div');
  divCardSecondary.className = 'cardSecondary';
  const address = document.createElement('address');
  address.className = 'cardSecondaryContent';
  address.innerHTML = restaurant.address;
  divCardSecondary.append(address);
  li.append(divCardSecondary);

  const divCardActions = document.createElement('div');
  divCardActions.className = 'cardActions';
  const more = document.createElement('a');
  more.className = 'cardActionsLink';
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', 'Details of ' + restaurant.name + ' Restaurant');
  divCardActions.append(more);
  li.append(divCardActions);
  return li
}


/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

