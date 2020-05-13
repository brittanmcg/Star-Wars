import React, { Component } from "react";
import ReactDOM from "react-dom";
import Select from "./Select";

// could have brought in lodash to avoid this, but didn't want to add the dependency
Array.prototype.diff = function (arr2) {
  var ret = [];
  for (var i in this) {
    if (arr2.indexOf(this[i]) > -1) {
      ret.push(this[i]);
    }
  }
  return ret;
};

class Form extends Component {
  constructor() {
    super();

    this.state = {
      characters: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getSimilarItemText = this.getSimilarItemText.bind(this);
  }

  componentDidMount() {
    const url = "http://swapi.dev/api/people";
    const characters = JSON.parse(localStorage.getItem("swapiCharacters"));

    this.setState({
      characters,
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
              "swapiCharacters",
              JSON.stringify(res.map((obj) => obj.results).flat(Infinity))
            )
          );
        });
    }
  }

  handleChange(event, selectId) {
    const { value } = event.target;
    this.setState(() => {
      return {
        valueOne: selectId === "1" ? value : this.state.valueOne,
        valueTwo: selectId === "2" ? value : this.state.valueTwo,
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
    if (!this.state.characters) return null;
    return (
      <form onSubmit={this.handleSubmit}>
        <h2>Please select two characters</h2>
        {this.state.characters && (
          <Select
            data={this.state.characters}
            handleChange={this.handleChange}
            selectId="1"
          />
        )}
        {this.state.characters && (
          <Select
            data={this.state.characters}
            handleChange={this.handleChange}
            selectId="2"
          />
        )}
        <div>
          {this.state.valueOne && this.state.valueTwo && (
            <p>
              {this.state.valueOne} and {this.state.valueTwo} were seen together
              in{" "}
              {this.state.films &&
                this.state.films.map((films, i) => {
                  return <span key={i}>{films.title},</span>;
                })}
              and they shared{" "}
              {this.state.vehicles &&
                this.state.vehicles.map((vehicle, i) => {
                  return <span key={i}>{vehicle.name},</span>;
                })}
              they were also in the following starships
              {this.state.starships &&
                this.state.starships.map((starship, i) => {
                  return <span key={i}>{starship.name},</span>;
                })}
            </p>
          )}
        </div>
        <button>Submit</button>
      </form>
    );
  }
}

export default Form;

const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<Form />, wrapper) : false;
