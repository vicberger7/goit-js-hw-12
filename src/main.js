import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import cssLoader from 'css-loader';

const refs = {
  formEl: document.querySelector('.js-search-form[data-id="1"]'),
  imageEl: document.querySelector('.js-image-container'),
};

function searchImage(imagename) {
  const BASE_URL = 'https://pixabay.com/api/';
  const searchParams = new URLSearchParams({
    key: '42138103-4c7bc70fd41b029843ebe333e',
    q: imagename,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });
  const PARAMS = `?${searchParams}`;
  const url = BASE_URL + PARAMS;

  return fetch(url)
    .then(res => res.json())
    .catch(error => {
      console.error(error);
    });
}

const loader = document.querySelector('.loader');
loader.style.display = 'none';

function showLoader() {
  loader.style.display = 'block';
}

function hideLoader() {
  loader.style.display = 'none';
}

function displayImages(images, clearPrevious = true) {
  const imageContainer = document.querySelector('.js-image-container');

  if (clearPrevious) {
    imageContainer.innerHTML = '';
  }

  showLoader();
  setTimeout(() => {
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

    imageContainer.innerHTML = galleryHTML;

    hideLoader();
    lightbox.refresh();
  }, 2000);
}

const lightbox = new SimpleLightbox('.js-image-container  a', {
  captionsData: 'alt',
  captionDelay: 250,
});

refs.formEl.addEventListener('submit', e => {
  e.preventDefault();

  const name = e.target.elements.query.value;

  if (!name) {
    iziToast.error({
      title: 'Помилка',
      message: 'Будь ласка, введіть текст для пошуку',
    });
    return;
  }

  searchImage(name)
    .then(data => {
      if (data.hits.length === 0) {
        iziToast.error({
          title: 'Error',
          message:
            'Sorry, there are no images matching your search query. Please try again!',
        });
      } else {
        displayImages(data.hits);
      }
    })
    .catch(error => {
      console.error(error);
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
      });
    });
});
