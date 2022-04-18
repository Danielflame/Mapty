'use strict';

    // prettier-ignore
    

    const form = document.querySelector('.form');
    const containerWorkouts = document.querySelector('.workouts');
    const inputType = document.querySelector('.form__input--type');
    let inputDistance = document.querySelector('.form__input--distance');
    let inputDuration = document.querySelector('.form__input--duration');
    let inputCadence = document.querySelector('.form__input--cadence');
    let inputElevation = document.querySelector('.form__input--elevation');
    let type;
    let date;
    let months;

    class Workout {
        id = (Date.now() + '').slice(-10);
        date = new Date();
        clicks = 0;

        constructor (coords,distance,duration) {
            this.coords = coords; //[lat,lng]
            this.distance = distance;
            this.duration = duration;
        }

        _setDescription() {
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()} ${this.date.getFullYear()}`;
        }

        click() {
            this.clicks++;
            console.log(this.clicks);
        }
    }

    class Running extends Workout {
        type = 'running';
        constructor (coords,distance,duration,cadence) {
            super(coords,distance,duration);
            this.cadence = cadence;
            this.calcPace();
            this._setDescription();
        }

        calcPace () {
            this.pace = this.duration / this.distance;
            return this.pace;
        }
    }

    class Cycling extends Workout {
        type = 'cycling';
        constructor (coords,distance,duration,eleGain) {
            super(coords,distance,duration);
            this.eleGain = eleGain;
            this.calcSpeed();
            this._setDescription();
        }

        calcSpeed () {
            this.speed = this.distance/ (this.duration / 60);
            return this.speed; 
        }
    }

    class App {
        //Private Class
        #map;
        #mapEvent;
        #mapZoomLevel = 13;
        #workouts = [];
        
        //constructor executes whenever an instance of the class App is instantiated
        constructor () {
            //Get current location
            this._getPosition();

            //Get data from local storage
            this._getLocalStorage();

            //Event handlers
            form.addEventListener('submit' , this._newWorkout.bind(this));
            inputType.addEventListener('change' , this._toggleElevationField.bind(this)); // doesnt need the bind keyword
            containerWorkouts.addEventListener('click' , this._moveToMap.bind(this));
        }

        _getPosition() {
            if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this) , function () { //we bind this.loadMap so it wont be undefined int the loadMap() Object
                    alert('Couldnt get your location');
                }
            )
        }

        _loadMap(position) {
            const { latitude, longitude } = position.coords;
            const coords = [latitude, longitude];
            this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);

            // console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);

            //Handling clicks on map
            this.#map.on('click', this._showForm.bind(this));

            //Show marker on map after map has loaded
            this.#workouts.forEach(work => {
                this._renderWorkoutOnMap(work);
            })
        }

        _showForm(mapE) {
            this.#mapEvent = mapE;
            form.classList.remove('hidden');
            inputDistance.focus();
        }

        _hideForm() {
            inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = " ";
            form.style.display = 'none';
            form.classList.add('hidden');
            setTimeout(() => (form.style.display = 'grid'), 1000);
        }

        _toggleElevationField() {
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        }

        _newWorkout(e) {
            //will return true if all the values are +ve
            const validInputs = (...inputs) => inputs.every(inps => Number.isFinite(inps));
            //will return true if all the values are > 0
            const allPositive = (...inputs) => inputs.every(inps => inps > 0);
             
            e.preventDefault();

            //Get Data from form
            type = inputType.value;
            
            const distance = +inputDistance.value;
            const duration = +inputDuration.value;
            let workout;
            const {lat,lng} = this.#mapEvent.latlng;
            console.log(lat,lng);
            //If workout running, create running object
            if (type === 'running') {
                const cadence = +inputCadence.value;
                //Check if data is valid
                // if (!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence)) 
                if(!validInputs(distance,duration,cadence) || !allPositive(distance,duration,cadence))
                return alert('Put A positive number');
                workout = new Running([lat,lng],distance,duration,cadence);
                console.log(workout.coords[0]);
            }

            //If workout cycling, create cycling object
            if (type === 'cycling') {
                const eleGain = +inputElevation.value;
                //Check if data is valid
                // if (!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(eleGain)) 
                if(!validInputs(distance,duration,eleGain) || !allPositive(distance,duration))
                return alert('Put A positive number');
                workout = new Cycling([lat,lng],distance,duration,eleGain);
            }

            //Add new workout to workout array
            this.#workouts.push(workout);
            console.log(workout);

            //Render workout on map as marker
            this._renderWorkoutOnMap(workout);

            //Render workout as list
            this._renderWorkoutAsList(workout);

            //Hide form + Clear Input Fields
            this._hideForm();

            // Set Localstorage to all workouts
            this._setLocaleStorage();

        }

        _renderWorkoutOnMap(workout) {
            L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                minWidth : 100,
                maxWidth: 250,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`
            }))
            .setPopupContent(`${workout.type=== 'running' ? '🏃‍♂️' : '🚴‍♀️' } ${workout.description}`)
            .openPopup();
        }
        //${workout.type=== 'running' ? '🏃‍♂️' : '🚴‍♀️' }
        
        _renderWorkoutAsList(workout) {
            let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2> 
                <div class="workout__details">
                    <span class="workout__icon">${type=== 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                    <span class="workout__value">${workout.distance + ''}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration + ''}</span>
                    <span class="workout__unit">min</span>
                </div>
            `;

            if (type === 'running') 
                html+= `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(1) + ''}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence + ''}</span>
                    <span class="workout__unit">spm</span>
                </div>
            </li>
            `;
            

            if (type === 'cycling')
                html+= `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(1) + ''}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.eleGain + ''}</span>
                    <span class="workout__unit">m</span>
                </div>
            </li>
            `;
            form.insertAdjacentHTML('afterend', html);
        }

        _moveToMap(e) {
            const workoutEL = e.target.closest('.workout');
            console.log(workoutEL);
            if(!workoutEL) return;
            const workout = this.#workouts.find(work => work.id === workoutEL.dataset.id);
            console.log(...workout.coords);
            this.#map.setView(workout.coords,this.#mapZoomLevel, {
                animate:true,
                pan: {
                    duration: 1,
                },
        });
        //    Using the public interface
            // workout.click();
        }

        _setLocaleStorage() {
            localStorage.setItem('workouts' , JSON.stringify(this.#workouts)) //Convert object to string. Dont use local storage to store large amount of data
        }

        _getLocalStorage() {
            const data = JSON.parse(localStorage.getItem('workouts')); //Converts string to object
            console.log(data);
            if (!data) return;
            this.#workouts = data;
            this.#workouts.forEach(work => {
                this._renderWorkoutAsList(work);
            })
        }

        reset() {
            localStorage.removeItem('workouts');
            location.reload();
        }
    }

    const apple = new App();
    console.log(apple);
    const run = new Running([23,45],45,34,234);
    const cyc = new Cycling([233,435],75,14,334);
    console.log(run,cyc);