import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ImagesApiService from './news-service';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');

gallery.addEventListener('click', event => {
  event.preventDefault();
});

const imagesApiService = new ImagesApiService();
const lightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', onSubmitForm);
loadMore.addEventListener('click', onLoadMore);

async function onSubmitForm(event) {
  event.preventDefault();
  gallery.innerHTML = '';
  loadMore.classList.add('is-hidden');

  imagesApiService.query =
    event.currentTarget.elements.searchQuery.value.trim();
  if (imagesApiService.query === '') {
    return;
  }

  event.currentTarget.elements.searchQuery.value = '';
  imagesApiService.resetPage();

  try {
    const response = await imagesApiService.fetchImages();
    renderForm(response);
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMore() {
  try {
    const response = await imagesApiService.fetchImages();
    scrollPage(response);
  } catch (error) {
    console.log(error);
  }
}

function scrollPage(response) {
  renderForm(response);
  const { height } = gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: height * 2.65,
    behavior: 'smooth',
  });
}

function renderForm({ data: { hits, totalHits } }) {
  if (hits.length === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );

    return;
  }

  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<a class='card-link' href='${largeImageURL}'><div class="photo-card">
    <img class='image' src="${webformatURL}" alt="${tags}" loading="lazy" />
    <div class="info">
      <p class="info-item">
        <b>Likes</b><span class="text">${likes}</span>
      </p>
      <p class="info-item">
        <b>Views</b><span class="text">${views}</span>
      </p>
      <p class="info-item">
        <b>Comments</b><span class="text">${comments}</span>
      </p>
      <p class="info-item">
        <b>Downloads</b><span class="text">${downloads}</span>
      </p>
    </div>
  </div></a>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);

  loadMore.classList.remove('is-hidden');

  if (gallery.children.length > totalHits) {
    loadMore.classList.add('is-hidden');
    Notify.info("We're sorry, but you've reached the end of search results.", {
      width: '500px',
      position: 'center-bottom',
      info: {
        background: 'linear-gradient(#1694e3, #0e51a9)',
      },
    });
    return;
  }

  lightbox.refresh();
}
