import Cycle from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';
import Rx from 'rx';

const GOOGLE_SHIT = 'AIzaSyC_5e-67fDS6lb593qvW-nN6uVN84ncpTE';

function log(string, value) {
  console.log(string, value);
  return value;
}

function locationsMaps(locations) {
  let children = locations.map(location =>
    h('div', {key: location.id, style: {display: 'inline-block'}}, [
      h('iframe',
        {
          width: 300,
          height: 300,
          frameborder: 0,
          style: {
            border: '0'
          },
          src: `https://www.google.com/maps/embed/v1/place?q=${location.name}&key=${GOOGLE_SHIT}`,
          allowfullscreen: true
        }
      )
    ])
  );
  return h('div', children);
}

function locationsList(locations) {
  let children = locations.map(location =>
    h('div', [
      h('span', location.name),
      h('span', {style: {color: 'transparent'}}, '_'),
      h('button.delete-location-button',
        {
          locationId: location.id,
          style: {float: 'right'}
        },
        'X')
    ])
  );
  return h('div', {style: {marginBottom: '20px'}}, children);
}

function view(state) {
  return h('div', [
    h('div', {style: {float: 'left', width: '300px'}}, [
      h('input', {id: 'location-name-input', placeholder: 'enter new location'}),
      locationsList(state.locations)
    ]),
    h('div', {style: {float: 'right'}}, [
      locationsMaps(state.locations)
    ])
  ]);
}

function main(drivers) {
  const BASE_STATE = {
    locations: [ // List {id: String, name: String}
      {id: '01', name: 'Helsinki'},
      {id: '02', name: 'Washington DC'},
      {id: '03', name: 'Hong Kong'},
      {id: '04', name: 'Sapporo'},
      {id: '05', name: 'Hakodate'},
      {id: '06', name: 'Aomori'},
      {id: '07', name: 'Tokyo'},
      {id: '08', name: 'Nagoya'},
      {id: '09', name: 'Kyoto'},
      {id: '10', name: 'Osaka'},
      {id: '11', name: 'Nagoya'},
      {id: '12', name: 'Tokyo'},
      {id: '13', name: 'Washington DC'}
    ]
  };

  let newLocation$ = drivers.DOM.select('#location-name-input').events('keydown')
    .filter(e => e.keyCode === 13)
    .filter(e => !!e.target.value)
    .map(e => {
      let newLocation = e.target.value;
      e.target.value = '';
      return newLocation;
    })
    .map(newLocationName =>
      state => {
        let newLocations = state.locations.slice();
        newLocations.push({
          id: Date.now() + newLocationName,
          name: newLocationName
        });
        return Object.assign({}, state, {
          locations: newLocations
        });
      }
    );

  let deleteLocation$ = drivers.DOM.select('.delete-location-button').events('click')
    .map(e => e.target.locationId)
    .map(locationId =>
      state => {
        let newLocations = state.locations.filter(location => location.id !== locationId);
        return Object.assign({}, state, {
          locations: newLocations
        });
      }
    );

  let view$ = Rx.Observable.merge(
      newLocation$,
      deleteLocation$
    )
    .startWith(BASE_STATE)
    .scan((a, mapper) => mapper(a))
    .map(state => view(state));

  return {
    DOM: view$
  };
}

let drivers = {
  DOM: makeDOMDriver('#app')
};

Cycle.run(main, drivers);
