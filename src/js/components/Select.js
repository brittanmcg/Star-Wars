import React, { Fragment } from "react";
import { v4 as uuidv4 } from "uuid";

function Select(props) {
  const { data, handleChange, selectId } = props;
  const newKey = uuidv4();
  return (
    <Fragment>
      <select onChange={(e) => handleChange(e, selectId)}>
        {data.map((character, i) => {
          return (
            <option key={i} value={character.name}>
              {character.name}
            </option>
          );
        })}
      </select>
    </Fragment>
  );
}

export default Select;
