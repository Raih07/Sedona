/***Добавление класса к body для подсветки taba по элементам и его удаление по клику на эл-ах***/
document.body.onkeydown = function (event) {
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
var btn_order = document.getElementById('btn_order');
var form = modal_win.getElementsByClassName("order-form")[0];
var arival_date = document.getElementById('arival-date');
var depar_date = document.getElementById("departurer-date");
var adults_count = document.getElementById("adults_count");
var child_count = document.getElementById("child_count");
var storage_arival_date = localStorage.getItem("arival_date");
var storage_depar_date = localStorage.getItem("departurer-date");
var storage_adults_count = localStorage.getItem("adults_count");
var storage_child_count = localStorage.getItem("child_count");

if (storage_arival_date && storage_depar_date) {
		arival_date.value = storage_arival_date;
		depar_date.value = storage_depar_date;
		adults_count.focus();
	} else if (storage_arival_date) {
		arival_date.value = storage_arival_date;
		depar_date.focus();
	} else {
		depar_date.value = storage_depar_date;
		arival_date.focus();
	}

function close_modal(event) {
	modal_win.classList.toggle('close');
	
	if (!modal_win.classList.contains('close')) {
		document.onkeydown = function (event) {
			if (event.keyCode === 27) { // escape
				modal_win.classList.add('close');
				modal_win.classList.remove("modal-error");
			}
		};
	} else {
		modal_win.classList.remove("modal-error");
	}
	event.preventDefault();
}

btn_order.addEventListener('click', close_modal);

form.addEventListener("submit", function (event) {
	modal_win.classList.remove("modal-error");
	if (arival_date.value == '' || depar_date.value == '') {
		//modal_win.offsetWidth = modal_win.offsetWidth;
		setTimeout(function () {
			modal_win.classList.add("modal-error");
		}, 0);
		//modal_win.classList.add("modal-error");
		event.preventDefault();
	} else {
		localStorage.setItem("arival_date", arival_date.value);
		localStorage.setItem("departurer-date", depar_date.value);
		localStorage.setItem("adults_count", adults_count.value);
		localStorage.setItem("child_count", child_count.value);
	}
});

modal_win.onclick = function(event) {
	var targ = event.target;
	//console.log(targ.className);
	if (targ.classList.contains = 'counts-control') {
		Count_people(targ);
	}
	else return;
}

function Count_people(targ) {
	var inp = document.getElementById(targ.dataset.target);
	var oper = targ.dataset.oper;
	switch (oper) {
			case 'minus':
				if (inp.classList.contains("input-adults")) {
					if (inp.value > 1) {
						inp.value--;
					}
				} else if (inp.value > 0) {
					inp.value--;
				}
				break;
			case 'plus':
				inp.value++;
				break;
		}
}

/*******Карта в подвале*********/

ymaps.ready(init);
var myMap,
	myPlacemar;

function init() {
	myMap = new ymaps.Map("YMapsID", {
		center: [34.870874, -111.762654],
		zoom: 10,
		controls: [] //убираем все кнопки управления

	});
	myMap.behaviors.disable('scrollZoom'); //отключение зума скролом колесика
	//myMap.behaviors.disable('drag');

	myMap.controls.add('zoomControl');

	myMap.controls.add('geolocationControl'); //геолокация
	myMap.controls.add('fullscreenControl'); //полноэкранный режим
	myMap.controls.add('routeButtonControl', {
		float: 'right'
	});
	myMap.controls.add('typeSelector'); //тип карты(спутник, карта, гибрид)

	myPlacemark = new ymaps.Placemark([34.870874, -111.762654], {}, {
        preset: 'islands#redIcon'
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