'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
let inputDistance = document.querySelector('.form__input--distance');
let inputDuration = document.querySelector('.form__input--duration');
let inputCadence = document.querySelector('.form__input--cadence');
let inputElevation = document.querySelector('.form__input--elevation');
let map,mapEvent;

if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(function (position) {
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];
        map = L.map('map').setView(coords, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);


        // console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);

        //Handling clicks on map
        map.on('click', function (mapE) {
            mapEvent = mapE;
            form.classList.remove('hidden');
            inputDistance.focus();
        })
    },
        function () {
            alert('Couldnt get your location');
        })

form.addEventListener('submit', function (e) {
    e.preventDefault();
    //Display Marker
    const {lat,lng} = mapEvent.latlng;
    L.marker([lat,lng]).addTo(map)
    .bindPopup(L.popup({
        minWidth : 100,
        maxWidth: 250,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup'
    }))
    .setPopupContent('Workout')
    .openPopup();

    //Clear Input Fields
    inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = " ";

    // console.log(mapEvent);
})

inputType.addEventListener('change' , function () {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
})
