let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error,'Catched');
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurantName');
  name.innerHTML = restaurant.name;
  name.tabIndex = '0';

  const address = document.getElementById('address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('img');
  image.className = 'img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.aditional_text;
  image.tabIndex = '0';

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurantTime');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    row.className = 'restaurantTableContent';
    row.tabIndex = '0';

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.className = 'reviewsTitle';
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.className = 'reviewCard';

  // Create a div with class card-primary that contains h2, h3.
  const divCardPrimary = document.createElement('div');
  divCardPrimary.className = 'card';
  // Restaurant name.
  const name = document.createElement('h2');
  name.className = 'cardTitle';
  name.innerHTML = review.name;
  divCardPrimary.appendChild(name);
  // Review date.
  const date = document.createElement('h3');
  date.className = 'cardSubtitle';
  date.innerHTML = review.date;
  divCardPrimary.appendChild(date);
  li.appendChild(divCardPrimary);

  const divCardActions = document.createElement('div');
  divCardActions.className = 'reviewCardRating';
  const rating = document.createElement('p');
  rating.className = 'reviewCardRatingContent';
  rating.innerHTML = `Rating: ${review.rating}`;
  divCardActions.append(rating);
  li.appendChild(divCardActions);

  // Create a div with class card-secondary that contains further content.
  const divCardSecondary = document.createElement('div');
  divCardSecondary.className = 'cardSecondary';
  // Review text.
  const comments = document.createElement('p');
  comments.className = 'cardContent';
  comments.innerHTML = review.comments;
  divCardSecondary.appendChild(comments);
  li.appendChild(divCardSecondary);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.className = 'breadcrumb';
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
