/***Добавление класса к body для подсветки taba по элементам и его удаление по клику на эл-ах***/
document.body.onkeydown = function (event) {
	var timer;
	if (event.keyCode === 9) { // TAB
		document.body.classList.add('tab-user');

		document.addEventListener('click', function () {
			document.body.classList.remove('tab-user');
		});
	}
};

document.removeEventListener('click', function () {
	document.body.classList.remove('tab-user');
});

/*******Открытие и закрытие формы(модальное окно)*********/

var modal_win = document.getElementById('modal');
var modal_btn = document.getElementById('modal_close');
var btn_write_us = document.getElementById('btn_write_us');
var form = modal_win.getElementsByClassName("feedback-form")[0];
var login = document.getElementById('feedback-form-fullname');
var email = document.getElementById("feedback-form-email");
var mess = document.getElementById("feedback-form-message");
var storage_login = localStorage.getItem("login");
var storage_mess = localStorage.getItem("mess");

function show_modal(event) {
	modal_win.classList.add('open');
	event.preventDefault();
	if (storage_login && storage_mess) {
		login.value = storage_login;
		mess.value = storage_mess;
		email.focus();
	} else if (storage_login) {
		login.value = storage_login;
		mess.focus();
	} else {
		login.focus();
		mess.value = storage_mess;
	}

	document.onkeydown = function (event) {
		if (event.keyCode === 27) { // escape
			close_modal(modal_win);
		}
	};
}

function close_modal(modal_win) {
	modal_win.classList.remove('open');
	modal_win.classList.remove("modal-error");
}



modal_btn.addEventListener('click', function () {
	close_modal(modal_win);
});

btn_write_us.addEventListener('click', show_modal);

form.addEventListener("submit", function (event) {
	modal_win.classList.remove("modal-error");
	if (login.value == '' || email.value == '' || mess.value == '') {
		//modal_win.offsetWidth = modal_win.offsetWidth;
		setTimeout(function () {
			modal_win.classList.add("modal-error");
		}, 0);
		//modal_win.classList.add("modal-error");
		event.preventDefault();
	} else {
		localStorage.setItem("login", login.value);
		localStorage.setItem("mess", mess.value);
	}
});

/*******Карта в подвале*********/

ymaps.ready(init);
var myMap,
	myPlacemar

function init() {
	myMap = new ymaps.Map("YMapsID", {
		center: [59.939107, 30.321463],
		zoom: 17,
		controls: [] //убираем все кнопки управления

	});
	myMap.behaviors.disable('scrollZoom'); //отключение зума скролом колесика
	//myMap.behaviors.disable('drag');

	myMap.controls.add('zoomControl', {
		float: 'none',
		position: {
			top: '100px',
			right: '20px'
		}
	});

	myMap.controls.add('geolocationControl'); //геолокация
	myMap.controls.add('fullscreenControl'); //полноэкранный режим
	myMap.controls.add('routeButtonControl', {
		float: 'right'
	});

	myPlacemark = new ymaps.Placemark([59.938631, 30.323055], {
		hintContent: 'NЁRDS',
		balloonContent: '191186, Санкт-Петербург, ул. Б. Конюшенная, д. 19/8'
	}, {
		iconLayout: 'default#image', //изображение без доп текста
		iconImageHref: 'img/marker.png',
		iconImageSize: [231, 190],
		iconImageOffset: [-48, -190] //смещение картинки
	});

	myMap.geoObjects.add(myPlacemark);
}

/*******Ползунок цены*********/

var sliderElem = document.getElementById('slider');
var minInput = document.getElementById('mincost');
var maxInput = document.getElementById('maxcost');

var slider = new Slider({
	elem: sliderElem,
	max: 20000
});

sliderElem.addEventListener('slide_min', function (event) {
	minInput.value = event.detail;
});

sliderElem.addEventListener('slide_max', function (event) {
	maxInput.value = event.detail;
});

minInput.onkeypress = maxInput.onkeypress = function (event) {
	var chr = getChar(event);

	if (event.ctrlKey || event.altKey || event.metaKey || chr == null) return; // специальная клавиша
	if (chr < '0' || chr > '9') return false;
}

minInput.oninput = function () {
	slider.setMinValue(this.value);
};

maxInput.oninput = function () {
	slider.setMaxValue(this.value);
};


function Slider(options) {
	//полифилл для включения CustomEvent в IE9+
	try {
		new CustomEvent("IE has CustomEvent, but doesn't support constructor");
	} catch (e) {
		window.CustomEvent = function (event, params) {
			var evt;
			params = params || {
				bubbles: false,
				cancelable: false,
				detail: undefined
			};

			evt = document.createEvent("CustomEvent");
			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
			return evt;
		};

		CustomEvent.prototype = Object.create(window.Event.prototype);
	}

	var elem = options.elem;
	var MinElem = document.getElementById('thumb-min');
	var MaxElem = document.getElementById('thumb-max');
	var scaleActive = document.getElementById('scale-active');
	var max = options.max || 20000;

	var sliderCoords, MinElemCoords, MaxElemCoords, shiftX;

	var pixelsPerValue = (elem.offsetWidth - MinElem.offsetWidth) / max;

	elem.ondragstart = function () {
		return false;
	};

	elem.onmousedown = function (event) {
		if (event.target.classList.contains("filter-thumb")) {
			startDrag(event);
			return false;
		}
	};

	function startDrag(event) {
		var type;

		MinElemCoords = MinElem.getBoundingClientRect();
		MaxElemCoords = MaxElem.getBoundingClientRect();
		sliderCoords = elem.getBoundingClientRect();
		shiftX = event.clientX - event.target.getBoundingClientRect().left;

		// alert(event.target.className);
		// alert(event.target.tagName);
		// alert(event.target.classList.contains('th1'));

		if (!event.target.previousElementSibling) {
			type = 'minElem';

		} else {
			type = 'maxElem';
		}
		
		/*
		document.addEventListener('mousemove', function(event) {
			onDocumentMouseMove(event, type);} );
		
		document.addEventListener('mouseup', onDocumentMouseUp);*/

		document.onmousemove = function (event) {
			onDocumentMouseMove(event, type);
		};

		document.onmouseup = function () {
			onDocumentMouseUp();
		};
	}

	function moveMin(clientX) {
		var newLeft = clientX - shiftX - sliderCoords.left;

		if (newLeft < 0) {
			newLeft = 0;
		}

		var rightEdge = MaxElemCoords.left - sliderCoords.left - MinElem.offsetWidth;

		if (newLeft > rightEdge) {
			newLeft = rightEdge;
		}

		MinElem.style.left = newLeft + 'px';
		scaleActive.style.left = newLeft + MinElem.offsetWidth / 2 + 'px';

		//console.log(positionToValue(newLeft));
		setEvent('slide_min', newLeft);
	}

	function moveMax(clientX) {
		var newLeft = clientX - shiftX - sliderCoords.left;

		var leftEdge = MinElemCoords.right - sliderCoords.left;

		if (newLeft < leftEdge) {
			newLeft = leftEdge;
		}

		var rightEdge = elem.offsetWidth - MaxElem.offsetWidth;

		if (newLeft > rightEdge) {
			newLeft = rightEdge;
		}

		MaxElem.style.left = newLeft + 'px';
		scaleActive.style.right = elem.offsetWidth - (newLeft + MaxElem.offsetWidth / 2) + 'px';

		//console.log(positionToValue(newLeft));
		setEvent('slide_max', newLeft);
	}

	function setEvent(events, data) {
		elem.dispatchEvent(new CustomEvent(events, {
			bubbles: true,
			detail: positionToValue(data)
		}));
	}

	function valueToPosition(value) {
		return pixelsPerValue * value;
	}

	function positionToValue(left) {
		return Math.round(left / pixelsPerValue);
	}

	function setMinValue(value) {
		//проверка выхода в отрицательную область
		if (value < 0) {
			value = 0;
		}
		var pos = valueToPosition(value);

		//проверка выхода за пределы макс ползунка
		var invalidPos = getLeftPosElem(MaxElem) - MaxElem.offsetWidth; //граничное положение макс позунка

		if (pos > invalidPos) {
			pos = invalidPos;
		}

		MinElem.style.left = pos + 'px';
		scaleActive.style.left = pos + MinElem.offsetWidth / 2 + 'px';
		setEvent('slide_min', pos);
	}

	function setMaxValue(value) {
		if (value > max) {
			value = max;
		}
		var pos = valueToPosition(value);

		//проверка выхода за пределы мин ползунка и правой границы слайдера
		var invalidPos = getLeftPosElem(MinElem) + MinElem.offsetWidth; //граничное положение мин позунка

		if (pos < invalidPos) {
			pos = invalidPos;
		}

		MaxElem.style.left = pos + 'px';
		scaleActive.style.right = elem.offsetWidth - (pos + MaxElem.offsetWidth / 2) + 'px';
		setEvent('slide_max', pos);
	}

	this.setMinValue = setMinValue;
	this.setMaxValue = setMaxValue;

	function onDocumentMouseMove(event, type) {
		switch (type) {
			case 'minElem':
				moveMin(event.clientX);
				break;
			case 'maxElem':
				moveMax(event.clientX);
				break;
		}
	}

	function onDocumentMouseUp() {
		endDrag();
	}

	function endDrag() {
		/*
		document.removeEventListener('mousemove', function(event) {
			onDocumentMouseMove(event, type);});
		document.removeEventListener('mouseup', onDocumentMouseUp);*/
		document.onmousemove = null;
		document.onmouseup = null;
	}

	function getLeftPosElem(el) {
		return el.getBoundingClientRect().left - sliderCoords.left;
	}
}

//ф-я получения символа по его коду
function getChar(event) {
	if (event.which == null) {
		if (event.keyCode < 32) return null;
		return String.fromCharCode(event.keyCode) // IE
	}

	if (event.which != 0 && event.charCode != 0) {
		if (event.which < 32) return null;
		return String.fromCharCode(event.which) // остальные
	}
	return null; // специальная клавиша
}