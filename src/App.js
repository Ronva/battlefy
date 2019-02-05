import React from 'react';
import produce from 'immer';

const initialState = { thing: null };

const Context = React.createContext(initialState);

const actions = {
  test: { type: 'thing', payload: 'test' }
};

const reducer = (state, { type, payload }) =>
  produce(state, draft => {
    draft[type] = payload;
  });

export default () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    dispatch(actions.test);
  }, []);

  React.useEffect(
    () => {
      console.log(state);
    },
    [state]
  );

  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="app">
        <nav aria-label="main">
          <></>
        </nav>
        <main role="main">
          <></>
        </main>
      </div>
    </Context.Provider>
  );
};
