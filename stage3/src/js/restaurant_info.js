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
        
      const theMap = document.getElementById('map');
      
      self.map.addListener('tilesloaded', function () {
        theMap.querySelectorAll('img').forEach(value => value.alt = "Google Maps Image Tile");
      });

      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
    console.log(id);
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
        console.log(restaurant);
      if (!restaurant) {
        console.error('Catched - ', error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}
/**
 * Get restaurant reviews from page URL.
 */
const fetchReviewsFromURL = (callback) => {
  if (self.reviews) { // review already fetched!
    callback(null, self.reviews)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No review id in URL'
    console.log('no id found')
    callback(error, null);
  } else {
    DBHelper.fetchReviewsByRestaurantId(id, (error, reviews) => {
      self.reviews = reviews;
      if (!reviews) {
        fillReviewsHTML(null);
        return;
      }
      fillReviewsHTML();
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

  const address = document.getElementById('address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('img');
  image.className = 'img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name + ' Restaurant Image';
  image.tabIndex = '0';

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  new LazyLoad();

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fetchReviewsFromURL();
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
const fillReviewsHTML = (reviews = self.reviews) => {
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
const createReviewHTML = (review) => {
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
  date.innerHTML = new Date(review.createdAt);
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
const fillBreadcrumb = (restaurant=self.restaurant) => {
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

const reviewRestaurant = (restaurant = self.restaurant) => {
  let id = restaurant.id;
  let name = document.getElementById("review-name").value;
  let rating = document.getElementById("review-rating").value;
  let message = document.getElementById("review-comment").value;

  if (name != "" && message != "") {
    let review = {
      restaurant_id: id,
      name: name,
      rating: rating,
      comments: message,
    }

    fetch(`${DBHelper.DATABASE_URL}/reviews`, {
      method: 'post',
      body: JSON.stringify(review)
    })
    .then(res => res.json())
    .catch(error => {
      console.log('Something went wrong submitting your review');
    });

    window.location.reload();
  }

  return false;
}
