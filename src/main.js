import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import axios from 'axios';

const domElements = {
  formEl: document.querySelector('.js-search-form[data-id="1"]'),
  imageEl: document.querySelector('.js-image-container'),
  loadMoreBtn: document.querySelector('.load-more-btn'),
  loader: document.querySelector('.loader'),
};

domElements.loader.style.display = 'none';

function showLoader() {
  domElements.loader.style.display = 'block';
}

function hideLoader() {
  domElements.loader.style.display = 'none';
}

async function searchImage(imageName, page = 1, perPage = 15) {
  const BASE_URL = 'https://pixabay.com/api/';
  const searchParams = new URLSearchParams({
    key: '42138103-4c7bc70fd41b029843ebe333e',
    q: imageName,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: perPage,
  });
  const PARAMS = `?${searchParams}`;
  const url = BASE_URL + PARAMS;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

function displayImages(images, clearPrevious = true) {
  const imageContainer = document.querySelector('.js-image-container');

  if (clearPrevious) {
    imageContainer.innerHTML = '';
  }

  const galleryHTML = images
    .map(image => {
      return `
      <a href="${image.largeImageURL}" class="lightbox">
        <div class="image-card">
          <img src="${image.webformatURL}" alt="${image.tags}">
          <span>Likes: ${image.likes}</span>
          <span>Views: ${image.views}</span>
          <span>Comments: ${image.comments}</span>
          <span>Downloads: ${image.downloads}</span>
        </div>
      </a>
    `;
    })
    .join('');

  if (!clearPrevious) {
    imageContainer.insertAdjacentHTML('beforeend', galleryHTML);
  } else {
    imageContainer.innerHTML = galleryHTML;
  }
  lightbox.refresh();

  const cardHeight = document
    .querySelector('.image-card')
    .getBoundingClientRect().height;

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

const lightbox = new SimpleLightbox('.js-image-container  a', {
  captionsData: 'alt',
  captionDelay: 250,
});

let searchQuery = '';
let currentPage = 1;

domElements.formEl.addEventListener('submit', async e => {
  e.preventDefault();
  showLoader();
  const name = e.target.elements.query.value.trim();

  if (!name) {
    iziToast.error({
      title: 'Error',
      message: 'Please enter a search query!',
    });
    searchQuery = '';
    currentPage = 1;
    domElements.loadMoreBtn.style.display = 'none';

    return hideLoader();
  }

  searchQuery = name;
  currentPage = 1;

  try {
    const data = await searchImage(name);
    if (data.hits.length === 0) {
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
      });
    } else {
      displayImages(data.hits);
      if (data.hits.length >= 15) {
        domElements.loadMoreBtn.style.display = 'block';
      }
    }
  } catch (error) {
    console.error(error);
    iziToast.error({
      title: 'Error',
      message:
        'Sorry, there are no images matching your search query. Please try again!',
    });
  } finally {
    hideLoader();
  }
});

let loadMoreEnabled = true;

async function loadMoreImages() {
  try {
    if (!loadMoreEnabled) return;
    showLoader();
    currentPage++;
    const data = await searchImage(searchQuery, currentPage);
    if (data.hits.length === 0) {
      loadMoreEnabled = false;
      domElements.loadMoreBtn.classList.add('disabled');
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      displayImages(data.hits, false);
    }
  } catch (error) {
    console.error(error);
    iziToast.error({
      title: 'Error',
      message: 'Failed to load more images!',
    });
  } finally {
    hideLoader();
  }
}

domElements.loadMoreBtn.addEventListener('click', () => {
  if (loadMoreEnabled) {
    loadMoreImages();
  }
});
