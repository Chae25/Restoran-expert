/* eslint-disable new-cap */
import 'regenerator-runtime'; /* for async await transpile */
import '../styles/main.css';
import { openDB } from 'idb';
import swRegister from './utils/sw-register';

document.addEventListener('DOMContentLoaded', async () => {
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.querySelector('.menu');
  const homeNav = document.getElementById('home-nav');
  const favoriteNav = document.getElementById('favorite-nav');
  const homeLink = document.getElementById('home-link');
  const mainSection = document.getElementById('main-section');
  const favoriteSection = document.getElementById('favorite-section');
  const detailSection = document.getElementById('detail-section');
  const heroSection = document.querySelector('.hero');

  let db;

  try {
    db = await openDB('restaurants-db', 1, {
      upgrade(db) {
        db.createObjectStore('favorites', { keyPath: 'id' });
      },
    });
  } catch (error) {
    console.error('Error opening database:', error);
  }

  menuBtn.addEventListener('click', () => {
    menu.classList.toggle('active');
  });

  homeNav.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.hash = '#home';
    showHome();
  });

  favoriteNav.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.hash = '#favorite';
    showFavorites();
  });

  homeLink.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.hash = '#home';
    showHome();
  });

  function showHome() {
    mainSection.style.display = 'block';
    favoriteSection.style.display = 'none';
    detailSection.style.display = 'none';
    heroSection.style.display = 'block';
  }

  async function showFavorites() {
    await renderFavoriteRestaurants();
    mainSection.style.display = 'none';
    favoriteSection.style.display = 'block';
    detailSection.style.display = 'none';
    heroSection.style.display = 'block';
  }

  async function renderRestaurants() {
    try {
      const response = await fetch('https://restaurant-api.dicoding.dev/list');
      const data = await response.json();
      const restaurantsContainer = document.getElementById('restaurants');
      restaurantsContainer.innerHTML = '';
      data.restaurants.forEach((restaurant) => {
        const restaurantCard = document.createElement('div');
        restaurantCard.className = 'card';
        restaurantCard.innerHTML = `
          <div class="image-wrapper">
            <img src="https://restaurant-api.dicoding.dev/images/medium/${restaurant.pictureId}" alt="${restaurant.name}">
          </div>
          <div class="content">
            <span class="location">${restaurant.city}</span>
            <span class="rating">Rating: ${restaurant.rating}</span>
            <h2>${restaurant.name}</h2>
            <p>${restaurant.description}</p>
            <button class="detail-link" data-id="${restaurant.id}">Detail</button>
          </div>
        `;
        restaurantsContainer.appendChild(restaurantCard);
      });

      document.querySelectorAll('.detail-link').forEach((button) => {
        button.addEventListener('click', (event) => {
          const restaurantId = event.target.dataset.id;
          window.location.hash = `#detail-${restaurantId}`;
          renderRestaurantDetail(restaurantId);
        });
      });
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    }
  }

  async function renderFavoriteRestaurants() {
    const favoriteRestaurantsContainer = document.getElementById('favorite-restaurants');
    favoriteRestaurantsContainer.innerHTML = ''; // Kosongkan konten sebelumnya
  
    const favoriteRestaurants = await db.getAll('favorites');
    favoriteRestaurants.forEach((restaurant) => {
      const restaurantCard = document.createElement('div');
      restaurantCard.className = 'card';
      restaurantCard.innerHTML = `
        <div class="image-wrapper">
          <img src="https://restaurant-api.dicoding.dev/images/medium/${restaurant.pictureId}" alt="${restaurant.name}">
        </div>
        <div class="content">
          <span class="location">${restaurant.city}</span>
          <span class="rating">Rating: ${restaurant.rating}</span>
          <h2>${restaurant.name}</h2>
          <p>${restaurant.description}</p>
          <button class="detail-link" data-id="${restaurant.id}">Detail</button>
        </div>
      `;
      favoriteRestaurantsContainer.appendChild(restaurantCard);
    });
  
    document.querySelectorAll('.detail-link').forEach((button) => {
      button.addEventListener('click', (event) => {
        const restaurantId = event.target.dataset.id;
        window.location.hash = `#detail-${restaurantId}`;
        renderRestaurantDetail(restaurantId);
      });
    });
  }
  

  async function renderRestaurantDetail(restaurantId) {
    try {
      const response = await fetch(`https://restaurant-api.dicoding.dev/detail/${restaurantId}`);
      const data = await response.json();
      const { restaurant } = data;
      const restaurantDetailContainer = document.getElementById('restaurant-detail');

      restaurantDetailContainer.innerHTML = `
        <h2>${restaurant.name}</h2>
        <img src="https://restaurant-api.dicoding.dev/images/medium/${restaurant.pictureId}" alt="${restaurant.name}">
        <p>Alamat: ${restaurant.address}</p>
        <p>Kota: ${restaurant.city}</p>
        <p>${restaurant.description}</p>
        <h3>Menu Makanan</h3>
        <ul>
          ${restaurant.menus.foods.map((food) => `<li>${food.name}</li>`).join('')}
        </ul>
        <h3>Menu Minuman</h3>
        <ul>
          ${restaurant.menus.drinks.map((drink) => `<li>${drink.name}</li>`).join('')}
        </ul>
        <h3>Customer Reviews</h3>
        <ul>
          ${restaurant.customerReviews.map((review) => `<li>${review.name} (${review.date}): ${review.review}</li>`).join('')}
        </ul>
        <button id="favorite-btn">Tambahkan ke Favorit</button>
      `;

      mainSection.style.display = 'none';
      favoriteSection.style.display = 'none';
      detailSection.style.display = 'block';
      heroSection.style.display = 'none';

      const favoriteBtn = document.getElementById('favorite-btn');
      let isFavorite = await db.get('favorites', restaurant.id);
      if (isFavorite) {
        favoriteBtn.textContent = 'Hapus dari Favorit';
      }

      favoriteBtn.addEventListener('click', async () => {
        isFavorite = await db.get('favorites', restaurant.id);
        if (isFavorite) {
          await db.delete('favorites', restaurant.id);
          favoriteBtn.textContent = 'Tambahkan ke Favorit';
        } else {
          await db.put('favorites', restaurant);
          favoriteBtn.textContent = 'Hapus dari Favorit';
        }
      
        // Hanya panggil renderFavoriteRestaurants jika tidak berada di halaman detail
        if (window.location.hash !== `#detail-${restaurant.id}`) {
          renderFavoriteRestaurants();
        }
      });
      
    } catch (error) {
      console.error('Error fetching restaurant detail:', error);
    }
  }

  function loadPage() {
    const { hash } = window.location;
    if (hash === '#home' || hash === '') {
      showHome();
    } else if (hash === '#favorite') {
      showFavorites();
    } else if (hash.startsWith('#detail-')) {
      const restaurantId = hash.split('-')[1];
      renderRestaurantDetail(restaurantId);
    }
  }
  

  // Initial render
  loadPage();
  renderRestaurants();
  window.addEventListener('hashchange', loadPage);
  swRegister();
});
