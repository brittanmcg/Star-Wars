import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Select from './Select';

// could have brought in lodash to avoid this, but didn't want to add the dependency
Array.prototype.diff = function (arr2) {
  const arr = [];
  for (let i in this) {
    if (arr2.indexOf(this[i]) > -1) {
      arr.push(this[i]);
    }
  }
  return arr;
};

class Form extends Component {
  constructor() {
    super();

    this.state = {
      characters: [],
      films: [],
      vehicles: [],
      starships: [],
      textDiv: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getSimilarItemText = this.getSimilarItemText.bind(this);
    this.openTextDiv = this.openTextDiv.bind(this);
  }

  componentDidMount() {
    const url = 'http://swapi.dev/api/people';
    const characters = JSON.parse(localStorage.getItem('swapiCharacters'));

    this.setState({
      characters,
      valueOne: 'Luke Skywalker',
      valueTwo: 'Luke Skywalker',
    });

    if (!characters) {
      const promises = Promise.all([
        fetch(url),
        fetch(`${url}?page=2`),
        fetch(`${url}?page=3`),
        fetch(`${url}?page=4`),
        fetch(`${url}?page=5`),
        fetch(`${url}?page=6`),
        fetch(`${url}?page=7`),
        fetch(`${url}?page=8`),
        fetch(`${url}?page=9`),
      ]);

      promises
        .then((results) => Promise.all(results.map((r) => r.json())))
        .then((res) => {
          this.setState(
            {
              characters: res.map((obj) => obj.results).flat(Infinity),
            },
            localStorage.setItem(
              'swapiCharacters',
              JSON.stringify(res.map((obj) => obj.results).flat(Infinity))
            )
          );
        });
    }
  }

  openTextDiv() {
    if (!this.state.textDiv)
      this.setState({
        textDiv: true,
      });
  }

  handleChange(event, selectId) {
    const { value } = event.target;
    this.setState(() => {
      return {
        textDiv: false,
        valueOne: selectId === '1' ? value : this.state.valueOne,
        valueTwo: selectId === '2' ? value : this.state.valueTwo,
      };
    });
  }

  async getSimilarItemText(similarItemsArray) {
    const similarItemsData = [];
    const promises = similarItemsArray.map((url) => {
      return fetch(url).then((res, rej) => {
        return res.json();
      });
    });
    await Promise.all(promises).then((data, err) => {
      if (err) console.log(err);
      data.forEach((res) => {
        similarItemsData.push(res);
      });
    });
    return similarItemsData;
  }

  async handleSubmit(e) {
    e.preventDefault();
    const first = this.state.characters.find(
      (character) => character.name === this.state.valueOne
    );
    const second = this.state.characters.find(
      (character) => character.name === this.state.valueTwo
    );

    const characterOneFilms = first.films;
    const characterTwoFilms = second.films;
    const characterOneVehicles = first.vehicles;
    const characterTwoVehicles = second.vehicles;
    const characterOneStarships = first.starships;
    const characterTwoStarships = second.starships;

    const likeFilms = characterOneFilms.diff(characterTwoFilms);
    const likeVehicles = characterOneVehicles.diff(characterTwoVehicles);
    const likeStarships = characterOneStarships.diff(characterTwoStarships);
    const apiFilmResults = await this.getSimilarItemText(likeFilms);
    const apiVehicleResults = await this.getSimilarItemText(likeVehicles);
    const apiStarshipResults = await this.getSimilarItemText(likeStarships);

    this.setState({
      films: apiFilmResults,
      vehicles: apiVehicleResults,
      starships: apiStarshipResults,
    });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h2>Please select two characters</h2>
        {this.state.characters && (
          <Select
            data={this.state.characters}
            handleChange={this.handleChange}
            selectId="1"
            classNames="select-css"
          />
        )}
        {this.state.characters && (
          <Select
            data={this.state.characters}
            handleChange={this.handleChange}
            selectId="2"
            classNames="select-css"
          />
        )}
        {this.state.textDiv && this.state.films.length > 0 && (
          <div>
            {this.state.valueOne && this.state.valueTwo && (
              <p>
                <b>{this.state.valueOne}</b> and <b>{this.state.valueTwo}</b>{' '}
                were seen together in{' '}
                {this.state.films &&
                  this.state.films.map((films, i) => {
                    return (
                      <span key={i}>
                        <b>{films.title}</b>,
                      </span>
                    );
                  })}
                {this.state.vehicles.length > 0 && (
                  <span>and they shared </span>
                )}
                {this.state.vehicles &&
                  this.state.vehicles.map((vehicle, i) => {
                    return (
                      <span key={i}>
                        <b>{vehicle.name}</b>,
                      </span>
                    );
                  })}
                {this.state.starships.length > 0 && (
                  <span>they were also in the following starships </span>
                )}
                {this.state.starships &&
                  this.state.starships.map((starship, i) => {
                    return (
                      <span key={i}>
                        <b>{starship.name}</b>,
                      </span>
                    );
                  })}
              </p>
            )}
          </div>
        )}
        {this.state.textDiv && this.state.films.length < 1 && (
          <div>
            <p>These characters never shared a film</p>
          </div>
        )}
        <button onClick={this.openTextDiv}>Submit</button>
      </form>
    );
  }
}

export default Form;

const wrapper = document.getElementById('container');
wrapper ? ReactDOM.render(<Form />, wrapper) : false;
