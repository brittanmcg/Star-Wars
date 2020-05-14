import React, { Fragment } from 'react';

function Select(props) {
  const { data, handleChange, selectId, classNames } = props;
  return (
    <Fragment>
      <select
        onChange={(e) => handleChange(e, selectId)}
        className={classNames}>
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
