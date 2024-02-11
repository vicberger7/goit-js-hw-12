import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import cssLoader from 'css-loader';
import axios from 'axios';

const refs = {
  formEl: document.querySelector('.js-search-form[data-id="1"]'),
  imageEl: document.querySelector('.js-image-container'),
  loadMoreBtn: document.querySelector('.load-more-btn'),
};

const loader = document.querySelector('.loader');
loader.style.display = 'none';

async function searchImage(imageName, page = 1, perPage = 15) {
  const BASE_URL = 'https://pixabay.com/api/';
  const searchParams = new URLSearchParams({
    key: '42138103-4c7bc70fd41b029843ebe333e',
    q: imageName,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_Page: perPage,
  });
  const PARAMS = `?${searchParams}`;
  const url = BASE_URL + PARAMS;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching images');
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
  loader.style.display = 'none';
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

async function loadMoreImages() {
  try {
    currentPage++;
    const data = await searchImage(searchQuery, currentPage);
    if (data.hits.length === 0) {
      loader.style.display = 'none';
      refs.loadMoreBtn.style.display = 'none';
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
  }
}

refs.loadMoreBtn.addEventListener('click', loadMoreImages);

refs.formEl.addEventListener('submit', async e => {
  e.preventDefault();
  loader.style.display = 'block';
  const name = e.target.elements.query.value.trim();

  if (!name) {
    loader.style.display = 'none';
    iziToast.error({
      title: 'Error',
      message: 'Please enter a search query!',
    });
    return;
  }

  searchQuery = name;
  currentPage = 1;
  refs.loadMoreBtn.style.display = 'none';

  try {
    const data = await searchImage(name);
    if (data.hits.length === 0) {
      loader.style.display = 'none';
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
      });
    } else {
      displayImages(data.hits);
      if (data.hits.length >= 15) {
        refs.loadMoreBtn.style.display = 'block';
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
    loader.style.display = 'none';
  }
});
